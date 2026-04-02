import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { PolicyService } from 'src/modules/admin/policy.service';

import { AddMessageKeywordsDto } from './dto/add-message-keywords.dto';
import { AddUserKeywordsDto } from './dto/add-user-keywords.dto';
import { KeywordMaster } from './entities/keyword-master.entity';
import { KeywordSynonym } from './entities/keyword-synonym.entity';
import { MessageKeyword } from './entities/message-keyword.entity';
import { UserKeyword } from './entities/user-keyword.entity';
import { KeywordNormalizer } from './utils/keyword-normalizer';

@Injectable()
export class KeywordsService {
  private readonly normalizer = new KeywordNormalizer();

  constructor(
    @InjectRepository(KeywordMaster)
    private readonly masterRepository: Repository<KeywordMaster>,
    @InjectRepository(KeywordSynonym)
    private readonly synonymRepository: Repository<KeywordSynonym>,
    @InjectRepository(UserKeyword)
    private readonly userKeywordRepository: Repository<UserKeyword>,
    @InjectRepository(MessageKeyword)
    private readonly messageKeywordRepository: Repository<MessageKeyword>,
    private readonly policyService: PolicyService,
  ) {}

  async normalizeKeyword(rawKeyword: string): Promise<KeywordMaster> {
    const normalized = this.normalizer.normalize(rawKeyword);

    const synonym = await this.synonymRepository.findOne({
      where: { synonym: normalized },
      relations: ['master'],
    });
    if (synonym) {
      return synonym.master;
    }

    let master = await this.masterRepository.findOne({
      where: { normalizedKeyword: normalized },
    });

    if (!master) {
      master = await this.masterRepository.save(
        this.masterRepository.create({
          normalizedKeyword: normalized,
          displayKeyword: rawKeyword.trim(),
          usageCount: 0,
        }),
      );
    }

    return master;
  }

  extractKeywordsFromText(text: string): string[] {
    const tokens = text
      .split(/[^a-zA-Z0-9가-힣]+/)
      .map((token) => this.normalizer.normalize(token))
      .filter((token) => token.length >= 2);

    return Array.from(new Set(tokens));
  }

  async autoAttachKeywordsToMessage(
    messageId: string,
    content: string,
  ): Promise<MessageKeyword[]> {
    const extracted = this.extractKeywordsFromText(content);
    if (extracted.length === 0) {
      return [];
    }

    const masters = await this.masterRepository.find({
      where: { normalizedKeyword: In(extracted) },
    });

    const synonyms = await this.synonymRepository.find({
      where: { synonym: In(extracted) },
      relations: ['master'],
    });

    const keywordMasterIds = new Set<string>([
      ...masters.map((master) => master.id),
      ...synonyms.map((synonym) => synonym.keywordMasterId),
    ]);

    const created: MessageKeyword[] = [];
    for (const keywordMasterId of keywordMasterIds) {
      const exists = await this.messageKeywordRepository.findOne({
        where: { messageId, keywordMasterId },
      });
      if (exists) {
        created.push(exists);
        continue;
      }

      const row = await this.messageKeywordRepository.save(
        this.messageKeywordRepository.create({
          messageId,
          keywordMasterId,
        }),
      );
      created.push(row);

      await this.masterRepository.increment({ id: keywordMasterId }, 'usageCount', 1);
    }

    return created;
  }

  async generateRecommendedKeywordsFromText(
    content: string,
    limit = 5,
  ): Promise<KeywordMaster[]> {
    const extracted = this.extractKeywordsFromText(content);

    if (extracted.length === 0) {
      return this.getRecommendedKeywords(limit);
    }

    const matched = await this.masterRepository.find({
      where: { normalizedKeyword: In(extracted) },
      order: { usageCount: 'DESC' },
      take: limit,
    });

    if (matched.length > 0) {
      return matched;
    }

    return this.getRecommendedKeywords(limit);
  }

  async addSynonym(keyword: string, synonymWord: string): Promise<KeywordSynonym> {
    const master = await this.normalizeKeyword(keyword);
    const normalizedSynonym = this.normalizer.normalize(synonymWord);

    const existing = await this.synonymRepository.findOne({
      where: { synonym: normalizedSynonym },
    });

    if (existing) {
      return existing;
    }

    return this.synonymRepository.save(
      this.synonymRepository.create({
        synonym: normalizedSynonym,
        keywordMasterId: master.id,
      }),
    );
  }

  async addUserKeywords(dto: AddUserKeywordsDto): Promise<UserKeyword[]> {
    const freeKeywordLimit = await this.policyService.getNumber('FREE_KEYWORD_LIMIT', 10);
    if ((dto.freeKeywords ?? []).length > freeKeywordLimit) {
      throw new BadRequestException(`Free keyword limit exceeded: ${freeKeywordLimit}`);
    }

    const mergedKeywords = [
      ...(dto.recommendedKeywords ?? []),
      ...(dto.freeKeywords ?? []),
    ];

    const result: UserKeyword[] = [];

    for (const keywordRaw of mergedKeywords) {
      const master = await this.normalizeKeyword(keywordRaw);
      master.usageCount += 1;
      await this.masterRepository.save(master);

      const exists = await this.userKeywordRepository.findOne({
        where: { userId: dto.userId, keywordMasterId: master.id },
      });
      if (exists) {
        result.push(exists);
        continue;
      }

      const row = this.userKeywordRepository.create({
        userId: dto.userId,
        keywordMasterId: master.id,
        isFreeInput: (dto.freeKeywords ?? []).includes(keywordRaw),
      });

      const saved = await this.userKeywordRepository.save(row);
      result.push(saved);
    }

    return result;
  }

  async addMessageKeywords(dto: AddMessageKeywordsDto): Promise<MessageKeyword[]> {
    const result: MessageKeyword[] = [];

    for (const rawKeyword of dto.keywords) {
      const master = await this.normalizeKeyword(rawKeyword);
      master.usageCount += 1;
      await this.masterRepository.save(master);

      const exists = await this.messageKeywordRepository.findOne({
        where: { messageId: dto.messageId, keywordMasterId: master.id },
      });
      if (exists) {
        result.push(exists);
        continue;
      }

      const row = this.messageKeywordRepository.create({
        messageId: dto.messageId,
        keywordMasterId: master.id,
      });
      const saved = await this.messageKeywordRepository.save(row);
      result.push(saved);
    }

    return result;
  }

  async getRecommendedKeywords(limit?: number): Promise<KeywordMaster[]> {
    const defaultLimit = await this.policyService.getNumber('RECOMMENDED_KEYWORD_LIMIT', 10);
    const resolvedLimit = limit ?? defaultLimit;

    return this.masterRepository.find({
      order: { usageCount: 'DESC' },
      take: resolvedLimit,
    });
  }

  async getUserKeywordIds(userId: string): Promise<string[]> {
    const rows = await this.userKeywordRepository.find({ where: { userId } });
    return rows.map((row) => row.keywordMasterId);
  }

  async getMessageKeywordIds(messageId: string): Promise<string[]> {
    const rows = await this.messageKeywordRepository.find({ where: { messageId } });
    return rows.map((row) => row.keywordMasterId);
  }
}
