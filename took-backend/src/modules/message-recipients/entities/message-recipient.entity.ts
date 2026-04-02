import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { MessageDirection } from 'src/common/enums/message-direction.enum';
import { AnonymousThread } from 'src/modules/anonymous-threads/entities/anonymous-thread.entity';
import { Message } from 'src/modules/messages/entities/message.entity';

@Entity('message_recipients')
export class MessageRecipient extends BaseEntity {
  @Column('uuid')
  messageId: string;

  @Column('uuid')
  recipientId: string;

  @Column('uuid')
  threadId: string;

  @Column({ type: 'int' })
  roundNumber: number;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @ManyToOne(() => Message, (message) => message.recipients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ManyToOne(() => AnonymousThread, (thread) => thread.messageRecipients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: AnonymousThread;
}
