import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';

import { KeywordMaster } from './keyword-master.entity';

@Entity('keyword_synonyms')
@Unique(['synonym'])
export class KeywordSynonym extends BaseEntity {
  @Column()
  synonym: string;

  @Column('uuid')
  keywordMasterId: string;

  @ManyToOne(() => KeywordMaster, (master) => master.synonyms, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'keywordMasterId' })
  master: KeywordMaster;
}
