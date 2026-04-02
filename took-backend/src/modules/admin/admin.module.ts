import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnonymousThread } from '../anonymous-threads/entities/anonymous-thread.entity';
import { BridgeRequest } from '../bridge-requests/entities/bridge-request.entity';
import { ChatMessage } from '../chat-messages/entities/chat-message.entity';
import { ChatRoom } from '../chat-rooms/entities/chat-room.entity';
import { KeywordMaster } from '../keywords/entities/keyword-master.entity';
import { KeywordSynonym } from '../keywords/entities/keyword-synonym.entity';
import { MessageRecipient } from '../message-recipients/entities/message-recipient.entity';
import { MessageReply } from '../message-replies/entities/message-reply.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { AdminController } from './admin.controller';
import { AdminLog } from './entities/admin-log.entity';
import { AdminPolicy } from './entities/admin-policy.entity';
import { PolicyHistory } from './entities/policy-history.entity';
import { PolicyService } from './policy.service';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Message,
      MessageRecipient,
      AnonymousThread,
      MessageReply,
      BridgeRequest,
      ChatRoom,
      ChatMessage,
      KeywordMaster,
      KeywordSynonym,
      AdminPolicy,
      AdminLog,
      PolicyHistory,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, PolicyService],
  exports: [PolicyService],
})
export class AdminModule {}
