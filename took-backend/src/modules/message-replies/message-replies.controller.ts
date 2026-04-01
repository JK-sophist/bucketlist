import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateMessageReplyDto } from './dto/create-message-reply.dto';
import { MessageRepliesService } from './message-replies.service';

@Controller('message-replies')
export class MessageRepliesController {
  constructor(private readonly service: MessageRepliesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateMessageReplyDto) {
    return this.service.create(dto);
  }
}
