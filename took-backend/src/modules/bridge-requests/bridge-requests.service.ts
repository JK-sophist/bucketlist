import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnonymousThreadsService } from 'src/modules/anonymous-threads/anonymous-threads.service';
import { ChatRoomsService } from 'src/modules/chat-rooms/chat-rooms.service';

import { CreateBridgeRequestDto } from './dto/create-bridge-request.dto';
import { BridgeRequest } from './entities/bridge-request.entity';

@Injectable()
export class BridgeRequestsService {
  constructor(
    @InjectRepository(BridgeRequest)
    private readonly repository: Repository<BridgeRequest>,
    private readonly anonymousThreadsService: AnonymousThreadsService,
    private readonly chatRoomsService: ChatRoomsService,
  ) {}

  findAll(): Promise<BridgeRequest[]> {
    return this.repository.find({ relations: ['thread'] });
  }

  async create(dto: CreateBridgeRequestDto): Promise<BridgeRequest> {
    const thread = await this.anonymousThreadsService.findById(dto.threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const existing = await this.repository.findOne({
      where: { threadId: dto.threadId },
    });

    if (existing) {
      throw new BadRequestException('Bridge request already exists for this thread');
    }

    if (thread.currentRoundNumber !== dto.roundNumber) {
      throw new BadRequestException('Round number does not match thread current round');
    }

    const request = this.repository.create(dto);
    return this.repository.save(request);
  }

  async approve(requestId: string): Promise<BridgeRequest> {
    const request = await this.repository.findOne({ where: { id: requestId } });

    if (!request) {
      throw new NotFoundException('Bridge request not found');
    }

    request.status = 'APPROVED';
    const saved = await this.repository.save(request);

    const thread = await this.anonymousThreadsService.findById(request.threadId);
    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const existingRoom = await this.chatRoomsService.findByThreadId(request.threadId);
    if (!existingRoom) {
      await this.chatRoomsService.create({
        threadId: request.threadId,
        participantAId: thread.participantAId,
        participantBId: thread.participantBId,
      });
    }

    return saved;
  }
}
