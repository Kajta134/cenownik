import { IsOptional, IsString, MaxLength, Validate } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { FrequencyValidator } from '../../validators/frequency.validator.js';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @ApiPropertyOptional()
  name?: string | null;

  @IsOptional()
  @ApiPropertyOptional()
  @Validate(FrequencyValidator)
  scraperFrequency?: number | null;
}
