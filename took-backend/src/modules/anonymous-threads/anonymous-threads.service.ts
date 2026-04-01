import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateAnonymousThreadDto } from './dto/create-anonymous-thread.dto';
import { AnonymousThread } from './entities/anonymous-thread.entity';

@Injectable()
export class AnonymousThreadsService {
  constructor(
    @InjectRepository(AnonymousThread)
    private readonly repository: Repository<AnonymousThread>,
  ) {}

  findAll(): Promise<AnonymousThread[]> {
    return this.repository.find();
  }

  async createOrGet(dto: CreateAnonymousThreadDto): Promise<AnonymousThread> {
    const existing = await this.repository.findOne({
      where: [
        { participantAId: dto.participantAId, participantBId: dto.participantBId },
        { participantAId: dto.participantBId, participantBId: dto.participantAId },
      ],
    });

    if (existing) {
      return existing;
    }

    const thread = this.repository.create(dto);
    return this.repository.save(thread);
  }

  findById(threadId: string): Promise<AnonymousThread | null> {
    return this.repository.findOne({ where: { id: threadId } });
  }
}
