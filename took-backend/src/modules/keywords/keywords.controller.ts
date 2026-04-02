import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { AddMessageKeywordsDto } from './dto/add-message-keywords.dto';
import { AddUserKeywordsDto } from './dto/add-user-keywords.dto';
import { KeywordsService } from './keywords.service';

@Controller('keywords')
export class KeywordsController {
  constructor(private readonly service: KeywordsService) {}

  @Get('recommended')
  recommended(@Query('limit') limit?: string) {
    return this.service.getRecommendedKeywords(limit ? Number(limit) : 10);
  }

  @Post('recommended-from-text')
  recommendedFromText(@Body() body: { content: string; limit?: number }) {
    return this.service.generateRecommendedKeywordsFromText(
      body.content,
      body.limit ?? 5,
    );
  }

  @Post('synonyms')
  addSynonym(@Body() body: { keyword: string; synonym: string }) {
    return this.service.addSynonym(body.keyword, body.synonym);
  }

  @Post('users')
  addUserKeywords(@Body() dto: AddUserKeywordsDto) {
    return this.service.addUserKeywords(dto);
  }

  @Post('messages')
  addMessageKeywords(@Body() dto: AddMessageKeywordsDto) {
    return this.service.addMessageKeywords(dto);
  }
}
