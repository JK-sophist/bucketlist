import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';

import { KeywordMaster } from './keyword-master.entity';

@Entity('user_keywords')
@Unique(['userId', 'keywordMasterId'])
export class UserKeyword extends BaseEntity {
  @Column('uuid')
  userId: string;

  @Column('uuid')
  keywordMasterId: string;

  @Column({ default: false })
  isFreeInput: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => KeywordMaster, (keyword) => keyword.userKeywords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'keywordMasterId' })
  keyword: KeywordMaster;
}
