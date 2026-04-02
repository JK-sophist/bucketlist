import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  nickname: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ nullable: true })
  region?: string;

  @Column({ type: 'float', default: 0 })
  trustScore: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastActiveAt?: Date;

  @Column({ default: false })
  isSuspended: boolean;

  @Column('simple-array', { nullable: true })
  blockedUserIds?: string[];
}
