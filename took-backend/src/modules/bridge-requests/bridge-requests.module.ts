import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnonymousThreadsModule } from '../anonymous-threads/anonymous-threads.module';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { BridgeRequest } from './entities/bridge-request.entity';
import { BridgeRequestsController } from './bridge-requests.controller';
import { BridgeRequestsService } from './bridge-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BridgeRequest]),
    AnonymousThreadsModule,
    ChatRoomsModule,
  ],
  controllers: [BridgeRequestsController],
  providers: [BridgeRequestsService],
})
export class BridgeRequestsModule {}
