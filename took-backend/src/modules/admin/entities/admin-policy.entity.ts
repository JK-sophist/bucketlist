import { Column, Entity, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('admin_policies')
@Unique(['policyKey'])
export class AdminPolicy extends BaseEntity {
  @Column()
  policyKey: string;

  @Column()
  category: string;

  @Column({ type: 'text' })
  policyValue: string;

  @Column()
  valueType: 'number' | 'string' | 'boolean' | 'json';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  editable: boolean;

  @Column('uuid', { nullable: true })
  updatedBy?: string;
}
