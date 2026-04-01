import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { AnonymousThread } from 'src/modules/anonymous-threads/entities/anonymous-thread.entity';
import { ChatMessage } from 'src/modules/chat-messages/entities/chat-message.entity';

@Entity('chat_rooms')
@Unique(['threadId'])
export class ChatRoom extends BaseEntity {
  @Column('uuid')
  threadId: string;

  @Column('uuid')
  participantAId: string;

  @Column('uuid')
  participantBId: string;

  @Column()
  participantANickname: string;

  @Column()
  participantBNickname: string;

  @ManyToOne(() => AnonymousThread, (thread) => thread.chatRooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'threadId' })
  thread: AnonymousThread;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  messages: ChatMessage[];
}
