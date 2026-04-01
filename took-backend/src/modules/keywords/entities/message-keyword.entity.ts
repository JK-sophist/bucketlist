import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { Message } from 'src/modules/messages/entities/message.entity';

import { KeywordMaster } from './keyword-master.entity';

@Entity('message_keywords')
@Unique(['messageId', 'keywordMasterId'])
export class MessageKeyword extends BaseEntity {
  @Column('uuid')
  messageId: string;

  @Column('uuid')
  keywordMasterId: string;

  @ManyToOne(() => Message, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => KeywordMaster, (keyword) => keyword.messageKeywords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'keywordMasterId' })
  keyword: KeywordMaster;
}
