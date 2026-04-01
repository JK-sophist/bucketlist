import { Injectable } from '@nestjs/common';
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
  ) {}

  async recommend(input: RecommendInput): Promise<{
    selected: User | null;
    candidates: Array<{ user: User; score: number }>;
  }> {
    const me = await this.userRepository.findOne({ where: { id: input.senderId } });
    if (!me) {
      return { selected: null, candidates: [] };
    }

    const allOthers = await this.userRepository.find();
    const others = allOthers.filter((user) => user.id !== input.senderId);

    const userKeywordIds = await this.keywordsService.getUserKeywordIds(input.senderId);
    const messageKeywordIds = await this.keywordsService.getMessageKeywordIds(
      input.messageId,
    );

    const scored: Array<{ user: User; score: number }> = [];

    for (const candidate of others) {
      let score = 0;

      // 조건 점수 (메시지 중심)
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
