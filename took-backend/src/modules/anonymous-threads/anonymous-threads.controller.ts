import { Body, Controller, Get, Post } from '@nestjs/common';

import { AnonymousThreadsService } from './anonymous-threads.service';
import { CreateAnonymousThreadDto } from './dto/create-anonymous-thread.dto';

@Controller('anonymous-threads')
export class AnonymousThreadsController {
  constructor(private readonly service: AnonymousThreadsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateAnonymousThreadDto) {
    return this.service.createOrGet(dto);
  }
}
