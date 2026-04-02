import { Body, Controller, Get, Post } from '@nestjs/common';

import { ChatRoomsService } from './chat-rooms.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';

@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly service: ChatRoomsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateChatRoomDto) {
    return this.service.create(dto);
  }
}
