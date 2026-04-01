import { Body, Controller, Get, Post } from '@nestjs/common';

import { ChatMessagesService } from './chat-messages.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly service: ChatMessagesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateChatMessageDto) {
    return this.service.create(dto);
  }
}
