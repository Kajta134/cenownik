import { Injectable, NotFoundException } from '@nestjs/common';
import { Offer } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { scrapeAmazon } from '../scrapers/amazon.scrapper.js';
import { OfferResponseDto } from './dto/offer-response.dto.js';

@Injectable()
export class OfferService {
  constructor(private database: PrismaService) {}
  async create(
    createOfferDto: CreateOfferDto,
    userEmail: string,
  ): Promise<OfferResponseDto> {
    const currentPrise = await scrapeAmazon(createOfferDto.link).catch(
      (error) => {
        console.error(
          `Błąd podczas skrapowania ceny dla linku ${createOfferDto.link}:`,
          error,
        );
      },
    );
    const user = await this.database.user.findUnique({
      where: { email: userEmail },
    });

    if (user === null) {
      throw new NotFoundException(`User with email ${userEmail} not found`);
    }

    const offer = await this.database.offer.create({
      data: {
        name: createOfferDto.name,
        link: createOfferDto.link,
        priceFreshold: createOfferDto.priceFreshold,
        userId: user.id,
      },
    });
    return {
      name: offer.name,
      link: offer.link,
      priceFreshold: offer.priceFreshold,
      currentPrice: currentPrise ?? 0,
    };
  }

  async findAll(): Promise<Offer[]> {
    return await this.database.offer.findMany();
  }

  async findOne(id: number): Promise<Offer> {
    const offer = this.database.offer.findUnique({
      where: { id },
    }) as Promise<Offer>;
    if ((await offer) === null) {
      throw new NotFoundException(`Offer with id ${id.toString()} not found`);
    }
    return await offer;
  }

  async update(id: number, updateOfferDto: UpdateOfferDto): Promise<Offer> {
    return this.database.offer
      .update({
        where: { id },
        data: {
          name: updateOfferDto.name,
          link: updateOfferDto.link,
          priceFreshold: updateOfferDto.priceFreshold,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Offer with id ${id.toString()} not found`);
      });
  }

  async remove(id: number): Promise<Offer> {
    return await this.database.offer
      .delete({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException(`Offer with id ${id.toString()} not found`);
      });
  }
}
