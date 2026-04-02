import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMessageRecipientDto } from './dto/create-message-recipient.dto';
import { MessageRecipient } from './entities/message-recipient.entity';

@Injectable()
export class MessageRecipientsService {
  constructor(
    @InjectRepository(MessageRecipient)
    private readonly repository: Repository<MessageRecipient>,
  ) {}

  findAll(): Promise<MessageRecipient[]> {
    return this.repository.find({ relations: ['message', 'thread'] });
  }

  async create(dto: CreateMessageRecipientDto): Promise<MessageRecipient> {
    const recipient = this.repository.create(dto);
    return this.repository.save(recipient);
  }
}
