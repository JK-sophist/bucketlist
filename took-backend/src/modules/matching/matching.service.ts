import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { KeywordsService } from 'src/modules/keywords/keywords.service';
import { User } from 'src/modules/users/entities/user.entity';

interface MatchConditions {
  gender?: string;
  region?: string;
  minAge?: number;
  maxAge?: number;
}

interface RecommendInput {
  senderId: string;
  messageId: string;
  conditions?: MatchConditions;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly keywordsService: KeywordsService,
    private readonly configService: ConfigService,
  ) {}

  async recommend(input: RecommendInput): Promise<{
    selected: User | null;
    candidates: Array<{ user: User; score: number }>;
  }> {
    const me = await this.userRepository.findOne({ where: { id: input.senderId } });
    if (!me) {
      return { selected: null, candidates: [] };
    }

    const prefilterLimit = this.configService.get<number>('MATCHING_CANDIDATE_LIMIT', 100);

    // 1) DB 1차 필터: gender / region / age range + limit
    const baseQuery = this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :senderId', { senderId: input.senderId })
      .orderBy('user.lastActiveAt', 'DESC', 'NULLS LAST')
      .addOrderBy('user.trustScore', 'DESC')
      .take(prefilterLimit);

    if (input.conditions?.gender) {
      baseQuery.andWhere('user.gender = :gender', {
        gender: input.conditions.gender,
      });
    }

    if (input.conditions?.region) {
      baseQuery.andWhere('user.region = :region', {
        region: input.conditions.region,
      });
    }

    if (input.conditions?.minAge) {
      baseQuery.andWhere('user.age >= :minAge', {
        minAge: input.conditions.minAge,
      });
    }

    if (input.conditions?.maxAge) {
      baseQuery.andWhere('user.age <= :maxAge', {
        maxAge: input.conditions.maxAge,
      });
    }

    const prefilteredCandidates = await baseQuery.getMany();

    // 2) 이후 메모리에서 점수 계산
    const userKeywordIds = await this.keywordsService.getUserKeywordIds(input.senderId);
    const messageKeywordIds = await this.keywordsService.getMessageKeywordIds(
      input.messageId,
    );

    const scored: Array<{ user: User; score: number }> = [];

    for (const candidate of prefilteredCandidates) {
      let score = 0;

      score += this.calculateConditionScore(candidate, input.conditions);

      const candidateKeywordIds = await this.keywordsService.getUserKeywordIds(
        candidate.id,
      );

      const userKeywordMatchCount = candidateKeywordIds.filter((id) =>
        userKeywordIds.includes(id),
      ).length;
      score += userKeywordMatchCount * 4;

      const messageKeywordMatchCount = candidateKeywordIds.filter((id) =>
        messageKeywordIds.includes(id),
      ).length;
      score += messageKeywordMatchCount * 6;

      // 키워드는 가중치이며, 없어도 매칭 가능
      score += (candidate.trustScore ?? 0) * 0.2;

      if (candidate.lastActiveAt) {
        const diffMs = Date.now() - candidate.lastActiveAt.getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        const inactiveDays = diffMs / dayMs;
        score += Math.max(0, 10 - inactiveDays);
      }

      scored.push({ user: candidate, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const topCandidates = scored.slice(0, 10);

    if (topCandidates.length === 0) {
      return { selected: null, candidates: [] };
    }

    const randomIndex = Math.floor(Math.random() * topCandidates.length);

    return {
      selected: topCandidates[randomIndex].user,
      candidates: topCandidates,
    };
  }

  private calculateConditionScore(
    candidate: User,
    conditions?: MatchConditions,
  ): number {
    if (!conditions) {
      return 0;
    }

    let score = 0;

    if (conditions.gender && candidate.gender === conditions.gender) {
      score += 5;
    }

    if (conditions.region && candidate.region === conditions.region) {
      score += 8;
    }

    if (conditions.minAge && candidate.age && candidate.age >= conditions.minAge) {
      score += 4;
    }

    if (conditions.maxAge && candidate.age && candidate.age <= conditions.maxAge) {
      score += 4;
    }

    return score;
  }
}
