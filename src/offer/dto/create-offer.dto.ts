import { IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  link: string;

  @ApiProperty()
  @IsNumber()
  priceFreshold: number;

  @ApiProperty()
  @IsNumber()
  userId: number;
}
