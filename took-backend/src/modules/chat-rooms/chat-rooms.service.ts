import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ChatRoom } from './entities/chat-room.entity';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly repository: Repository<ChatRoom>,
  ) {}

  findAll(): Promise<ChatRoom[]> {
    return this.repository.find({ relations: ['thread'] });
  }

  findByThreadId(threadId: string): Promise<ChatRoom | null> {
    return this.repository.findOne({ where: { threadId } });
  }

  findById(chatRoomId: string): Promise<ChatRoom | null> {
    return this.repository.findOne({ where: { id: chatRoomId } });
  }

  async create(dto: CreateChatRoomDto): Promise<ChatRoom> {
    const room = this.repository.create({
      ...dto,
      participantANickname: this.generateRandomNickname(),
      participantBNickname: this.generateRandomNickname(),
    });

    return this.repository.save(room);
  }

  private generateRandomNickname(): string {
    const adjectives = ['Swift', 'Quiet', 'Bright', 'Mellow', 'Lucky'];
    const animals = ['Fox', 'Otter', 'Koala', 'Hawk', 'Panda'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const suffix = Math.floor(Math.random() * 900 + 100);

    return `${adj}${animal}${suffix}`;
  }
}
