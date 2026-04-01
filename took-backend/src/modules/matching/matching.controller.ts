import { Body, Controller, Post } from '@nestjs/common';

import { RecommendMatchDto } from './dto/recommend-match.dto';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Post('recommend')
  recommend(@Body() dto: RecommendMatchDto) {
    return this.service.recommend({ senderId: dto.senderId, messageId: dto.messageId, conditions: dto.conditions });
  }
}
