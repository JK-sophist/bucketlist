import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { AnonymousThread } from 'src/modules/anonymous-threads/entities/anonymous-thread.entity';

@Entity('bridge_requests')
@Unique(['threadId'])
export class BridgeRequest extends BaseEntity {
  @Column('uuid')
  threadId: string;

  @Column('uuid')
  requestedById: string;

  @Column({ type: 'int' })
  roundNumber: number;

  @Column({ default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  @ManyToOne(() => AnonymousThread, (thread) => thread.bridgeRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'threadId' })
  thread: AnonymousThread;
}
