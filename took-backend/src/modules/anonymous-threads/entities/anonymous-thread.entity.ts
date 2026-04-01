import { Column, Entity, OneToMany, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { BridgeRequest } from 'src/modules/bridge-requests/entities/bridge-request.entity';
import { ChatRoom } from 'src/modules/chat-rooms/entities/chat-room.entity';
import { MessageRecipient } from 'src/modules/message-recipients/entities/message-recipient.entity';
import { MessageReply } from 'src/modules/message-replies/entities/message-reply.entity';

@Entity('anonymous_threads')
@Unique(['participantAId', 'participantBId'])
export class AnonymousThread extends BaseEntity {
  @Column('uuid')
  participantAId: string;

  @Column('uuid')
  participantBId: string;

  @Column({ default: 1 })
  currentRoundNumber: number;

  @Column({ default: 'OPEN' })
  status: 'OPEN' | 'BRIDGED' | 'CLOSED';

  @OneToMany(() => MessageRecipient, (recipient) => recipient.thread)
  messageRecipients: MessageRecipient[];

  @OneToMany(() => MessageReply, (reply) => reply.thread)
  replies: MessageReply[];

  @OneToMany(() => BridgeRequest, (request) => request.thread)
  bridgeRequests: BridgeRequest[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.thread)
  chatRooms: ChatRoom[];
}
