import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { KeywordsModule } from '../keywords/keywords.module';
import { User } from '../users/entities/user.entity';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KeywordsModule],
  providers: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
