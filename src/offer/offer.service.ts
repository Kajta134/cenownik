import { Injectable, NotFoundException } from '@nestjs/common';
import { Offer } from 'src/generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';

@Injectable()
export class OfferService {
  constructor(private database: PrismaService) {}
  async create(createOfferDto: CreateOfferDto): Promise<Offer> {
    await this.database.user
      .findUnique({
        where: { id: createOfferDto.userId },
      })
      .then((user) => {
        if (user === null) {
          throw new NotFoundException(
            `User with id ${createOfferDto.userId.toString()} not found`,
          );
        }
      });

    return this.database.offer.create({
      data: {
        name: createOfferDto.name,
        link: createOfferDto.link,
        priceFreshold: createOfferDto.priceFreshold,
        userId: createOfferDto.userId,
      },
    });
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
          userId: updateOfferDto.userId,
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
