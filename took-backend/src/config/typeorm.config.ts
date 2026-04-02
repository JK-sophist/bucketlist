import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AnonymousThread } from 'src/modules/anonymous-threads/entities/anonymous-thread.entity';
import { AdminLog } from 'src/modules/admin/entities/admin-log.entity';
import { AdminPolicy } from 'src/modules/admin/entities/admin-policy.entity';
import { BridgeRequest } from 'src/modules/bridge-requests/entities/bridge-request.entity';
import { ChatMessage } from 'src/modules/chat-messages/entities/chat-message.entity';
import { ChatRoom } from 'src/modules/chat-rooms/entities/chat-room.entity';
import { KeywordMaster } from 'src/modules/keywords/entities/keyword-master.entity';
import { KeywordSynonym } from 'src/modules/keywords/entities/keyword-synonym.entity';
import { MessageKeyword } from 'src/modules/keywords/entities/message-keyword.entity';
import { UserKeyword } from 'src/modules/keywords/entities/user-keyword.entity';
import { MessageRecipient } from 'src/modules/message-recipients/entities/message-recipient.entity';
import { MessageReply } from 'src/modules/message-replies/entities/message-reply.entity';
import { Message } from 'src/modules/messages/entities/message.entity';
import { User } from 'src/modules/users/entities/user.entity';

export const typeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST', 'localhost'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get<string>('POSTGRES_USER', 'postgres'),
  password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
  database: configService.get<string>('POSTGRES_DB', 'took'),
  entities: [
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
    UserKeyword,
    MessageKeyword,
    AdminPolicy,
    AdminLog,
  ],
  synchronize: configService.get<string>('NODE_ENV', 'development') !== 'production',
});
