import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnonymousThreadsController } from './anonymous-threads.controller';
import { AnonymousThreadsService } from './anonymous-threads.service';
import { AnonymousThread } from './entities/anonymous-thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnonymousThread])],
  controllers: [AnonymousThreadsController],
  providers: [AnonymousThreadsService],
  exports: [AnonymousThreadsService],
})
export class AnonymousThreadsModule {}
