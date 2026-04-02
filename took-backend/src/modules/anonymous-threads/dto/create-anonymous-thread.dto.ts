import { IsUUID } from 'class-validator';

export class CreateAnonymousThreadDto {
  @IsUUID()
  participantAId: string;

  @IsUUID()
  participantBId: string;
}
