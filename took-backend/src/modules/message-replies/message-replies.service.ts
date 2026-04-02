import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AnonymousThreadsService } from 'src/modules/anonymous-threads/anonymous-threads.service';

import { CreateMessageReplyDto } from './dto/create-message-reply.dto';
import { MessageReply } from './entities/message-reply.entity';

@Injectable()
export class MessageRepliesService {
  constructor(
    @InjectRepository(MessageReply)
    private readonly repository: Repository<MessageReply>,
    private readonly anonymousThreadsService: AnonymousThreadsService,
  ) {}

  findAll(): Promise<MessageReply[]> {
    return this.repository.find({ relations: ['thread'] });
  }

  async create(dto: CreateMessageReplyDto): Promise<MessageReply> {
    const thread = await this.anonymousThreadsService.findById(dto.threadId);

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    const reply = this.repository.create(dto);
    return this.repository.save(reply);
  }
}
