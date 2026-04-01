import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserKeyword } from '../keywords/entities/user-keyword.entity';
import { KeywordsModule } from '../keywords/keywords.module';
import { MessageRecipient } from '../message-recipients/entities/message-recipient.entity';
import { User } from '../users/entities/user.entity';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserKeyword, MessageRecipient]),
    KeywordsModule,
  ],
  providers: [MatchingService],
  controllers: [MatchingController],
  exports: [MatchingService],
})
export class MatchingModule {}
