import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminModule } from '../admin/admin.module';

import { KeywordMaster } from './entities/keyword-master.entity';
import { KeywordSynonym } from './entities/keyword-synonym.entity';
import { MessageKeyword } from './entities/message-keyword.entity';
import { UserKeyword } from './entities/user-keyword.entity';
import { KeywordsController } from './keywords.controller';
import { KeywordsService } from './keywords.service';

@Module({
  imports: [
    AdminModule,
    TypeOrmModule.forFeature([
      KeywordMaster,
      KeywordSynonym,
      UserKeyword,
      MessageKeyword,
    ]),
  ],
  providers: [KeywordsService],
  controllers: [KeywordsController],
  exports: [KeywordsService],
})
export class KeywordsModule {}
