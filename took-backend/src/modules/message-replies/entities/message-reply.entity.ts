import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { MessageDirection } from 'src/common/enums/message-direction.enum';
import { AnonymousThread } from 'src/modules/anonymous-threads/entities/anonymous-thread.entity';

@Entity('message_replies')
export class MessageReply extends BaseEntity {
  @Column('uuid')
  threadId: string;

  @Column('uuid')
  senderId: string;

  @Column('text')
  content: string;

  @Column({ type: 'int' })
  roundNumber: number;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @ManyToOne(() => AnonymousThread, (thread) => thread.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'threadId' })
  thread: AnonymousThread;
}
