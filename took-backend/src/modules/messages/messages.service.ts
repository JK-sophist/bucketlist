import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RedisService } from 'src/common/redis/redis.service';
import { MessageDirection } from 'src/common/enums/message-direction.enum';
import { PolicyService } from 'src/modules/admin/policy.service';
import { AnonymousThreadsService } from 'src/modules/anonymous-threads/anonymous-threads.service';
import { KeywordsService } from 'src/modules/keywords/keywords.service';
import { MatchingService } from 'src/modules/matching/matching.service';
import { MessageRecipient } from 'src/modules/message-recipients/entities/message-recipient.entity';
import { User } from 'src/modules/users/entities/user.entity';

import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageRecipient)
    private readonly recipientRepository: Repository<MessageRecipient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly anonymousThreadsService: AnonymousThreadsService,
    private readonly matchingService: MatchingService,
    private readonly keywordsService: KeywordsService,
    private readonly policyService: PolicyService,
    private readonly redisService: RedisService,
  ) {}

  findAll(): Promise<Message[]> {
    return this.messageRepository.find({ relations: ['recipients'] });
  }

  async createOriginalMessage(dto: CreateMessageDto): Promise<Message> {
    const messageMaxLength = await this.policyService.getNumber('MESSAGE_MAX_LENGTH', 500);
    if (dto.content.length > messageMaxLength) {
      throw new BadRequestException(`Message exceeds max length: ${messageMaxLength}`);
    }

    const dailyLimit = await this.policyService.getNumber('DAILY_FREE_MESSAGE_LIMIT', 20);
    const duplicateBlockMinutes = await this.policyService.getNumber(
      'DUPLICATE_MESSAGE_BLOCK_MINUTES',
      10,
    );

    await this.enforceDailyLimit(dto.senderId, dailyLimit);
    await this.enforceDuplicateBlock(dto.senderId, dto.content, duplicateBlockMinutes);

    const message = await this.messageRepository.save(
      this.messageRepository.create({
        senderId: dto.senderId,
        content: dto.content,
      }),
    );

    await this.keywordsService.autoAttachKeywordsToMessage(message.id, dto.content);

    const sender = await this.userRepository.findOne({ where: { id: dto.senderId } });
    const senderBlockedIds = this.extractBlockedUserIds(sender);

    const matchResult = await this.matchingService.recommend({
      senderId: dto.senderId,
      messageId: message.id,
      conditions: dto.conditions,
    });
    const matchedTopCandidates = matchResult.candidates
      .slice(0, dto.topN ?? 5)
      .map((item) => item.user.id);

    const mergedRecipientIds = [...(dto.recipientIds ?? []), ...matchedTopCandidates];

    const uniqueRecipientIds = Array.from(new Set(mergedRecipientIds)).filter(
      (recipientId) => recipientId !== dto.senderId,
    );

    const recipients = await this.userRepository.findBy({
      id: In(uniqueRecipientIds),
    });
    const filteredRecipients = recipients.filter((recipient) => {
      const recipientBlockedIds = this.extractBlockedUserIds(recipient);
      return (
        !senderBlockedIds.includes(recipient.id) &&
        !recipientBlockedIds.includes(dto.senderId)
      );
    });

    for (const recipient of filteredRecipients) {
      const thread = await this.anonymousThreadsService.createOrGet({
        participantAId: dto.senderId,
        participantBId: recipient.id,
      });

      const duplicateRecipient = await this.recipientRepository.findOne({
        where: {
          messageId: message.id,
          recipientId: recipient.id,
        },
      });

      if (duplicateRecipient) continue;

      await this.recipientRepository.save(
        this.recipientRepository.create({
          messageId: message.id,
          recipientId: recipient.id,
          threadId: thread.id,
          roundNumber: dto.roundNumber,
          direction: MessageDirection.SENT,
        }),
      );

      await this.redisService.enqueue(
        'message_notifications',
        JSON.stringify({
          type: 'NEW_MESSAGE',
          messageId: message.id,
          senderId: dto.senderId,
          recipientId: recipient.id,
          threadId: thread.id,
        }),
      );
    }

    return this.messageRepository.findOneOrFail({
      where: { id: message.id },
      relations: ['recipients'],
    });
  }

  private async enforceDailyLimit(senderId: string, dailyLimit: number): Promise<void> {
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);

    const todayCount = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.senderId = :senderId', { senderId })
      .andWhere('message.createdAt >= :start', { start })
      .getCount();

    if (todayCount >= dailyLimit) {
      throw new BadRequestException('Daily free message limit exceeded');
    }
  }

  private async enforceDuplicateBlock(
    senderId: string,
    content: string,
    blockMinutes: number,
  ): Promise<void> {
    const since = new Date(Date.now() - blockMinutes * 60 * 1000);
    const duplicate = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.senderId = :senderId', { senderId })
      .andWhere('message.content = :content', { content })
      .andWhere('message.createdAt >= :since', { since })
      .getOne();

    if (duplicate) {
      throw new BadRequestException('Duplicate message blocked by policy');
    }
  }

  private extractBlockedUserIds(user: User | null): string[] {
    if (!user) return [];

    const blocked = (user as unknown as { blockedUserIds?: string[] }).blockedUserIds;
    return Array.isArray(blocked) ? blocked : [];
  }
}
