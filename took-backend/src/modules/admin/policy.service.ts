import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RedisService } from 'src/common/redis/redis.service';

import { POLICY_DEFAULTS } from './policy-defaults';
import { AdminPolicy } from './entities/admin-policy.entity';
import { PolicyHistory } from './entities/policy-history.entity';

@Injectable()
export class PolicyService implements OnModuleInit {
  private readonly cacheTtlSeconds = 60;

  constructor(
    @InjectRepository(AdminPolicy)
    private readonly policyRepository: Repository<AdminPolicy>,
    @InjectRepository(PolicyHistory)
    private readonly historyRepository: Repository<PolicyHistory>,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  async seedDefaults(): Promise<void> {
    for (const policy of POLICY_DEFAULTS) {
      const existing = await this.policyRepository.findOne({
        where: { policyKey: policy.key },
      });
      if (existing) continue;

      await this.policyRepository.save(
        this.policyRepository.create({
          policyKey: policy.key,
          category: policy.category,
          policyValue: policy.value,
          valueType: policy.valueType,
          description: policy.description,
          editable: policy.editable,
        }),
      );
    }
  }

  async getPolicies(): Promise<AdminPolicy[]> {
    return this.policyRepository.find({ order: { category: 'ASC', policyKey: 'ASC' } });
  }

  async getPolicyHistories(policyKey?: string): Promise<PolicyHistory[]> {
    return this.historyRepository.find({
      where: policyKey ? { policyKey } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async getNumber(key: string, fallback: number): Promise<number> {
    const policy = await this.getPolicyByKey(key);
    if (!policy) return fallback;

    const parsed = Number(policy.policyValue);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  async getString(key: string, fallback: string): Promise<string> {
    const policy = await this.getPolicyByKey(key);
    return policy?.policyValue ?? fallback;
  }

  async setPolicy(params: {
    policyKey: string;
    policyValue: string;
    updatedBy?: string;
    reason?: string;
    category?: string;
    valueType?: 'number' | 'string' | 'boolean' | 'json';
    description?: string;
    editable?: boolean;
  }): Promise<AdminPolicy> {
    const existing = await this.policyRepository.findOne({
      where: { policyKey: params.policyKey },
    });

    const oldValue = existing?.policyValue;
    const next = existing
      ? Object.assign(existing, {
          policyValue: params.policyValue,
          updatedBy: params.updatedBy,
          category: params.category ?? existing.category,
          valueType: params.valueType ?? existing.valueType,
          description: params.description ?? existing.description,
          editable: params.editable ?? existing.editable,
        })
      : this.policyRepository.create({
          policyKey: params.policyKey,
          policyValue: params.policyValue,
          updatedBy: params.updatedBy,
          category: params.category ?? 'custom',
          valueType: params.valueType ?? 'string',
          description: params.description,
          editable: params.editable ?? true,
        });

    const saved = await this.policyRepository.save(next);

    await this.historyRepository.save(
      this.historyRepository.create({
        changedBy: params.updatedBy,
        policyKey: params.policyKey,
        oldValue,
        newValue: params.policyValue,
        reason: params.reason,
      }),
    );

    await this.redisService.deleteCache(this.getCacheKey(params.policyKey));

    return saved;
  }

  private async getPolicyByKey(policyKey: string): Promise<AdminPolicy | null> {
    const cacheKey = this.getCacheKey(policyKey);
    const cached = await this.redisService.getCache(cacheKey);
    if (cached) {
      return JSON.parse(cached) as AdminPolicy;
    }

    const policy = await this.policyRepository.findOne({ where: { policyKey } });
    if (!policy) {
      return null;
    }

    await this.redisService.setCache(
      cacheKey,
      JSON.stringify(policy),
      this.cacheTtlSeconds,
    );

    return policy;
  }

  private getCacheKey(policyKey: string): string {
    return `policy:${policyKey}`;
  }
}
