import { IsEnum, IsInt, IsString, IsUUID, Min } from 'class-validator';

import { MessageDirection } from 'src/common/enums/message-direction.enum';

export class CreateMessageReplyDto {
  @IsUUID()
  threadId: string;

  @IsUUID()
  senderId: string;

  @IsString()
  content: string;

  @IsInt()
  @Min(1)
  roundNumber: number;

  @IsEnum(MessageDirection)
  direction: MessageDirection;
}
