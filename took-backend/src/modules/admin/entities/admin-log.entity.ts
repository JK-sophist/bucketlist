import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('admin_logs')
export class AdminLog extends BaseEntity {
  @Column('uuid')
  adminUserId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  targetType?: string;

  @Column({ nullable: true })
  targetId?: string;

  @Column({ type: 'text', nullable: true })
  metadata?: string;
}
