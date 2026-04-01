import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchingModule } from '../matching/matching.module';
import { KeywordsModule } from '../keywords/keywords.module';
import { User } from '../users/entities/user.entity';
import { AnonymousThreadsModule } from '../anonymous-threads/anonymous-threads.module';
import { MessageRecipient } from '../message-recipients/entities/message-recipient.entity';
import { Message } from './entities/message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageRecipient, User]),
    AnonymousThreadsModule,
    MatchingModule,
    KeywordsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
