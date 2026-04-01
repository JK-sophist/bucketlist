import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateMessageRecipientDto } from './dto/create-message-recipient.dto';
import { MessageRecipientsService } from './message-recipients.service';

@Controller('message-recipients')
export class MessageRecipientsController {
  constructor(private readonly service: MessageRecipientsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateMessageRecipientDto) {
    return this.service.create(dto);
  }
}
