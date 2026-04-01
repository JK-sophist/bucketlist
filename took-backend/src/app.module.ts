import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RedisModule } from './common/redis/redis.module';
import { typeOrmOptions } from './config/typeorm.config';
import { AnonymousThreadsModule } from './modules/anonymous-threads/anonymous-threads.module';
import { AuthModule } from './modules/auth/auth.module';
import { BridgeRequestsModule } from './modules/bridge-requests/bridge-requests.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { ChatRoomsModule } from './modules/chat-rooms/chat-rooms.module';
import { KeywordsModule } from './modules/keywords/keywords.module';
import { MatchingModule } from './modules/matching/matching.module';
import { MessageRecipientsModule } from './modules/message-recipients/message-recipients.module';
import { MessageRepliesModule } from './modules/message-replies/message-replies.module';
import { MessagesModule } from './modules/messages/messages.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmOptions,
    }),
    RedisModule,
    AuthModule,
    UsersModule,
    MessagesModule,
    MessageRecipientsModule,
    AnonymousThreadsModule,
    MessageRepliesModule,
    BridgeRequestsModule,
    ChatRoomsModule,
    ChatMessagesModule,
    KeywordsModule,
    MatchingModule,
  ],
})
export class AppModule {}
