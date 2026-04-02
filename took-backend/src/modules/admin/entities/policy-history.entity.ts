import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('policy_histories')
export class PolicyHistory extends BaseEntity {
  @Column('uuid', { nullable: true })
  changedBy?: string;

  @Column()
  policyKey: string;

  @Column({ type: 'text', nullable: true })
  oldValue?: string;

  @Column({ type: 'text' })
  newValue: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;
}
