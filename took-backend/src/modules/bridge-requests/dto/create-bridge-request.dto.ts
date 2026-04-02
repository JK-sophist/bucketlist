import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateBridgeRequestDto {
  @IsUUID()
  threadId: string;

  @IsUUID()
  requestedById: string;

  @IsInt()
  @Min(1)
  roundNumber: number;
}
