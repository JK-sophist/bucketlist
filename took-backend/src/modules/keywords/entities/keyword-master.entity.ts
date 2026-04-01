import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

import { KeywordSynonym } from './keyword-synonym.entity';
import { MessageKeyword } from './message-keyword.entity';
import { UserKeyword } from './user-keyword.entity';

@Entity('keyword_master')
export class KeywordMaster extends BaseEntity {
  @Column({ unique: true })
  normalizedKeyword: string;

  @Column()
  displayKeyword: string;

  @Column({ default: 0 })
  usageCount: number;

  @OneToMany(() => KeywordSynonym, (synonym) => synonym.master)
  synonyms: KeywordSynonym[];

  @OneToMany(() => UserKeyword, (userKeyword) => userKeyword.keyword)
  userKeywords: UserKeyword[];

  @OneToMany(() => MessageKeyword, (messageKeyword) => messageKeyword.keyword)
  messageKeywords: MessageKeyword[];
}
