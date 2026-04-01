import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageRecipient } from './entities/message-recipient.entity';
import { MessageRecipientsController } from './message-recipients.controller';
import { MessageRecipientsService } from './message-recipients.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageRecipient])],
  controllers: [MessageRecipientsController],
  providers: [MessageRecipientsService],
  exports: [MessageRecipientsService],
})
export class MessageRecipientsModule {}
