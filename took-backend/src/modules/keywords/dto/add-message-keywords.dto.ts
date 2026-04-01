import { IsArray, IsString, IsUUID } from 'class-validator';

export class AddMessageKeywordsDto {
  @IsUUID()
  messageId: string;

  @IsArray()
  @IsString({ each: true })
  keywords: string[];
}
