import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { AnnouncementAudience } from '@repo/db';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsEnum(AnnouncementAudience)
  @IsOptional()
  audience?: AnnouncementAudience;
}
