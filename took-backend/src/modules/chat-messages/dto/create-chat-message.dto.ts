import { IsString, IsUUID } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  chatRoomId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;
}
