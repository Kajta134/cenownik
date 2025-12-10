import { IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsString()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  @MinLength(2)
  name: string;
}
