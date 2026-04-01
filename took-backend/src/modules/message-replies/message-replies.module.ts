import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnonymousThreadsModule } from '../anonymous-threads/anonymous-threads.module';
import { MessageReply } from './entities/message-reply.entity';
import { MessageRepliesController } from './message-replies.controller';
import { MessageRepliesService } from './message-replies.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageReply]), AnonymousThreadsModule],
  controllers: [MessageRepliesController],
  providers: [MessageRepliesService],
  exports: [MessageRepliesService],
})
export class MessageRepliesModule {}
