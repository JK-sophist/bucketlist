import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MessageMatchConditionsDto {
  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  minAge?: number;

  @IsOptional()
  @IsInt()
  @Max(100)
  maxAge?: number;
}

export class CreateMessageDto {
  @IsUUID()
  senderId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  recipientIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  topN?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageMatchConditionsDto)
  conditions?: MessageMatchConditionsDto;

  @IsInt()
  @Min(1)
  roundNumber: number;
}
