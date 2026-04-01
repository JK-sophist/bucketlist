import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { MessageRecipient } from 'src/modules/message-recipients/entities/message-recipient.entity';

@Entity('messages')
export class Message extends BaseEntity {
  @Column('uuid')
  senderId: string;

  @Column('text')
  content: string;

  @OneToMany(() => MessageRecipient, (recipient) => recipient.message)
  recipients: MessageRecipient[];
}
