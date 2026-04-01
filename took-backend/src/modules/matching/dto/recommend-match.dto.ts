import {
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

class MatchConditionsDto {
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

export class RecommendMatchDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  messageId: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MatchConditionsDto)
  conditions?: MatchConditionsDto;
}
