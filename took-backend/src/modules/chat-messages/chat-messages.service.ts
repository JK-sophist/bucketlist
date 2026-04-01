import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatRoomsService } from 'src/modules/chat-rooms/chat-rooms.service';

import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatMessage } from './entities/chat-message.entity';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
    private readonly chatRoomsService: ChatRoomsService,
  ) {}

  findAll(): Promise<ChatMessage[]> {
    return this.repository.find({ relations: ['chatRoom'] });
  }

  async create(dto: CreateChatMessageDto): Promise<ChatMessage> {
    const room = await this.chatRoomsService.findById(dto.chatRoomId);
    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    const message = this.repository.create(dto);
    return this.repository.save(message);
  }
}
