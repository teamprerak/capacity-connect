import { IsString, IsNotEmpty, IsInt, Min, Max, MinLength, MaxLength, IsUrl, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../../common/utils/sanitize';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  @Transform(({ value }) => sanitizeString(value))
  title: string;

  @IsInt()
  @Min(1)
  @Max(200)
  sequenceOrder: number;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  @Transform(({ value }) => sanitizeString(value))
  title?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  sequenceOrder?: number;

  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;
}
