import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MessageRecipient } from 'src/modules/message-recipients/entities/message-recipient.entity';
import { Message } from 'src/modules/messages/entities/message.entity';
import { UserKeyword } from 'src/modules/keywords/entities/user-keyword.entity';
import { PolicyService } from 'src/modules/admin/policy.service';
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
    @InjectRepository(UserKeyword)
    private readonly userKeywordRepository: Repository<UserKeyword>,
    @InjectRepository(MessageRecipient)
    private readonly messageRecipientRepository: Repository<MessageRecipient>,
    private readonly keywordsService: KeywordsService,
    private readonly policyService: PolicyService,
  ) {}

  async recommend(input: RecommendInput): Promise<{
    selected: User | null;
    candidates: Array<{ user: User; score: number }>;
  }> {
    const me = await this.userRepository.findOne({ where: { id: input.senderId } });
    if (!me) {
      return { selected: null, candidates: [] };
    }

    const prefilterLimit = await this.policyService.getNumber('MATCHING_CANDIDATE_LIMIT', 100);
    const recentExcludeDays = await this.policyService.getNumber(
      'MATCHING_RECENT_EXCLUDE_DAYS',
      7,
    );
    const userKeywordWeight = await this.policyService.getNumber('MATCHING_USER_KEYWORD_WEIGHT', 4);
    const messageKeywordWeight = await this.policyService.getNumber('MATCHING_MESSAGE_KEYWORD_WEIGHT', 6);
    const trustScoreWeight = await this.policyService.getNumber('TRUST_SCORE_WEIGHT', 0.2);
    const activityWeight = await this.policyService.getNumber('ACTIVITY_WEIGHT', 1);

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

    const senderBlockedIds = this.extractBlockedUserIds(me);

    // 구조 초안: 최근 N일 내 동일 발신자가 보낸 recipient 제외
    const recentRecipientIds = await this.findRecentRecipientIds(
      input.senderId,
      recentExcludeDays,
    );

    const filteredByBlockAndRecent = prefilteredCandidates.filter((candidate) => {
      const candidateBlocked = this.extractBlockedUserIds(candidate);

      if (senderBlockedIds.includes(candidate.id)) {
        return false;
      }

      if (candidateBlocked.includes(input.senderId)) {
        return false;
      }

      if (recentRecipientIds.has(candidate.id)) {
        return false;
      }

      return true;
    });

    if (filteredByBlockAndRecent.length === 0) {
      return { selected: null, candidates: [] };
    }

    const userKeywordIds = await this.keywordsService.getUserKeywordIds(input.senderId);
    const messageKeywordIds = await this.keywordsService.getMessageKeywordIds(
      input.messageId,
    );

    // N+1 제거: 후보 user_keywords를 1회 IN 조회 후 맵으로 변환
    const candidateUserIds = filteredByBlockAndRecent.map((user) => user.id);
    const candidateKeywordRows = await this.userKeywordRepository.find({
      where: { userId: In(candidateUserIds) },
    });

    const candidateKeywordMap = new Map<string, string[]>();
    for (const row of candidateKeywordRows) {
      const current = candidateKeywordMap.get(row.userId) ?? [];
      current.push(row.keywordMasterId);
      candidateKeywordMap.set(row.userId, current);
    }

    const scored: Array<{ user: User; score: number }> = [];

    for (const candidate of filteredByBlockAndRecent) {
      let score = 0;

      score += this.calculateConditionScore(candidate, input.conditions);

      const candidateKeywordIds = candidateKeywordMap.get(candidate.id) ?? [];

      const userKeywordMatchCount = candidateKeywordIds.filter((id) =>
        userKeywordIds.includes(id),
      ).length;
      score += userKeywordMatchCount * userKeywordWeight;

      const messageKeywordMatchCount = candidateKeywordIds.filter((id) =>
        messageKeywordIds.includes(id),
      ).length;
      score += messageKeywordMatchCount * messageKeywordWeight;

      // 키워드는 가중치이며, 없어도 매칭 가능
      score += (candidate.trustScore ?? 0) * trustScoreWeight;

      if (candidate.lastActiveAt) {
        const diffMs = Date.now() - candidate.lastActiveAt.getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        const inactiveDays = diffMs / dayMs;
        score += Math.max(0, 10 - inactiveDays) * activityWeight;
      }

      scored.push({ user: candidate, score });
    }

    scored.sort((a, b) => b.score - a.score);
    const topCandidates = scored.slice(0, 10);

    if (topCandidates.length === 0) {
      return { selected: null, candidates: [] };
    }

    const weightedSelected = this.pickWeightedRandom(topCandidates);

    return {
      selected: weightedSelected,
      candidates: topCandidates,
    };
  }


  private pickWeightedRandom(candidates: Array<{ user: User; score: number }>): User {
    const normalized = candidates.map((candidate) => ({
      user: candidate.user,
      score: Math.max(candidate.score, 0),
    }));

    const totalScore = normalized.reduce((sum, candidate) => sum + candidate.score, 0);

    if (totalScore <= 0) {
      const fallbackIndex = Math.floor(Math.random() * candidates.length);
      return candidates[fallbackIndex].user;
    }

    const randomPoint = Math.random() * totalScore;
    let cumulative = 0;

    for (const candidate of normalized) {
      cumulative += candidate.score;
      if (randomPoint <= cumulative) {
        return candidate.user;
      }
    }

    return normalized[normalized.length - 1].user;
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

  private extractBlockedUserIds(user: User): string[] {
    return Array.isArray(user.blockedUserIds) ? user.blockedUserIds : [];
  }

  private async findRecentRecipientIds(
    senderId: string,
    recentDays: number,
  ): Promise<Set<string>> {
    const since = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000);

    const rows = await this.messageRecipientRepository
      .createQueryBuilder('recipient')
      .innerJoin(Message, 'message', 'message.id = recipient.messageId')
      .where('message.senderId = :senderId', { senderId })
      .andWhere('message.createdAt >= :since', { since })
      .select('recipient.recipientId', 'recipientId')
      .getRawMany<{ recipientId: string }>();

    return new Set(rows.map((row) => row.recipientId));
  }
}
