import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { RedisService } from 'src/common/redis/redis.service';
import { MessageDirection } from 'src/common/enums/message-direction.enum';
import { AnonymousThreadsService } from 'src/modules/anonymous-threads/anonymous-threads.service';
import { MatchingService } from 'src/modules/matching/matching.service';
import { KeywordsService } from 'src/modules/keywords/keywords.service';
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
    private readonly redisService: RedisService,
  ) {}

  findAll(): Promise<Message[]> {
    return this.messageRepository.find({ relations: ['recipients'] });
  }

  async createOriginalMessage(dto: CreateMessageDto): Promise<Message> {
    const message = await this.messageRepository.save(
      this.messageRepository.create({
        senderId: dto.senderId,
        content: dto.content,
      }),
    );

    await this.keywordsService.autoAttachKeywordsToMessage(message.id, dto.content);

    const sender = await this.userRepository.findOne({ where: { id: dto.senderId } });
    const senderBlockedIds = this.extractBlockedUserIds(sender);

    // 1) matching.service 호출 → 후보군 계산
    const matchResult = await this.matchingService.recommend({
      senderId: dto.senderId,
      messageId: message.id,
      conditions: dto.conditions,
    });
    const matchedTopCandidates = matchResult.candidates
      .slice(0, dto.topN ?? 5)
      .map((item) => item.user.id);

    // 수동 수신자 입력(옵션) + 매칭 결과를 병합
    const mergedRecipientIds = [
      ...(dto.recipientIds ?? []),
      ...matchedTopCandidates,
    ];

    // 2) 중복 제거 + 자기 자신 제외
    const uniqueRecipientIds = Array.from(new Set(mergedRecipientIds)).filter(
      (recipientId) => recipientId !== dto.senderId,
    );

    // 3) 차단 유저 제외
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

    // 4) message_recipients + anonymous_thread 생성 + 알림 큐 적재
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

      if (duplicateRecipient) {
        continue;
      }

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

  private extractBlockedUserIds(user: User | null): string[] {
    if (!user) {
      return [];
    }

    const blocked = (user as unknown as { blockedUserIds?: string[] }).blockedUserIds;
    return Array.isArray(blocked) ? blocked : [];
  }
}
