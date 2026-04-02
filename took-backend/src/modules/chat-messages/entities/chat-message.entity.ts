import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ChatRoom } from 'src/modules/chat-rooms/entities/chat-room.entity';

@Entity('chat_messages')
export class ChatMessage extends BaseEntity {
  @Column('uuid')
  chatRoomId: string;

  @Column('uuid')
  senderId: string;

  @Column('text')
  content: string;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatRoomId' })
  chatRoom: ChatRoom;
}
