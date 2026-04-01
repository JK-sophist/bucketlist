import { IsEnum, IsInt, IsUUID, Min } from 'class-validator';

import { MessageDirection } from 'src/common/enums/message-direction.enum';

export class CreateMessageRecipientDto {
  @IsUUID()
  messageId: string;

  @IsUUID()
  recipientId: string;

  @IsUUID()
  threadId: string;

  @IsInt()
  @Min(1)
  roundNumber: number;

  @IsEnum(MessageDirection)
  direction: MessageDirection;
}
