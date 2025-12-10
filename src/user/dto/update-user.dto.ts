import { IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(15)
  @ApiPropertyOptional()
  name?: string | null;
}
