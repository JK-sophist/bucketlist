import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddUserKeywordsDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  freeKeywords?: string[];
}
