import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { BridgeRequestsService } from './bridge-requests.service';
import { CreateBridgeRequestDto } from './dto/create-bridge-request.dto';

@Controller('bridge-requests')
export class BridgeRequestsController {
  constructor(private readonly service: BridgeRequestsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateBridgeRequestDto) {
    return this.service.create(dto);
  }

  @Patch(':requestId/approve')
  approve(@Param('requestId') requestId: string) {
    return this.service.approve(requestId);
  }
}
