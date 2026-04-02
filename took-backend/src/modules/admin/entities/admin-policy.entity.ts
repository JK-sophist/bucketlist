import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('admin_policies')
@Unique(['policyKey'])
export class AdminPolicy extends BaseEntity {
  @Column()
  policyKey: string;

  @Column({ type: 'text' })
  policyValue: string;
}
