import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { Offer } from '../generated/prisma/client.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard.js';
import { UserMetadata } from '../user/dto/user-metadata.js';
import { OfferResponseDto } from './dto/offer-response.dto.js';

@Controller('offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(201)
  async create(
    @Request()
    request: {
      user: UserMetadata;
    },
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offerService.create(createOfferDto, request.user.email);
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
