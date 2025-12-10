import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Offer } from 'src/generated/prisma/client.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createOfferDto: CreateOfferDto): Promise<Offer> {
    return this.offerService.create(createOfferDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Offer[]> {
    return this.offerService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id: string): Promise<Offer> {
    return this.offerService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<Offer> {
    return this.offerService.update(+id, updateOfferDto);
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string): Promise<Offer> {
    return this.offerService.remove(+id);
  }
}
