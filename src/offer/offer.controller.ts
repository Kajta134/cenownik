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
import { Offer, Role } from '../generated/prisma/client.js';
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async findAll(
    @Request() request: { user: UserMetadata },
  ): Promise<OfferResponseDto[]> {
    if (request.user.role === Role.ADMIN) {
      return this.offerService.findAll();
    } else {
      return this.offerService.findByUserEmail(request.user.email);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async findOne(
    @Param('id') id: string,
    @Request() request: { user: UserMetadata },
  ): Promise<OfferResponseDto> {
    return this.offerService.findOne(
      +id,
      request.user.email,
      request.user.role,
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
    @Request() request: { user: UserMetadata },
  ): Promise<Offer> {
    return this.offerService.update(
      +id,
      updateOfferDto,
      request.user.email,
      request.user.role,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async remove(
    @Param('id') id: string,
    @Request() request: { user: UserMetadata },
  ): Promise<Offer> {
    return this.offerService.remove(+id, request.user.email, request.user.role);
  }
}
