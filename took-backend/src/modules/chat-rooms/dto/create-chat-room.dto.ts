import { IsUUID } from 'class-validator';

export class CreateChatRoomDto {
  @IsUUID()
  threadId: string;

  @IsUUID()
  participantAId: string;

  @IsUUID()
  participantBId: string;
}
