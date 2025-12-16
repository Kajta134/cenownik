import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Offer, PriceHistory, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { OfferResponseDto } from './dto/offer-response.dto.js';
import { ScrapperService } from '../scrapers/scraper.service.js';
import { BadAdressException } from '../exceptions/bad-adress.exception.js';

@Injectable()
export class OfferService {
  constructor(
    private database: PrismaService,
    private scraperService: ScrapperService,
  ) {}
  async create(
    createOfferDto: CreateOfferDto,
    userEmail: string,
  ): Promise<OfferResponseDto> {
    const currentPrise = await this.scraperService.scrapePrice(
      createOfferDto.link,
    );
    if (currentPrise === null) {
      throw new BadAdressException(
        `The provided link ${createOfferDto.link} is invalid or unreachable.`,
      );
    }

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
      id: offer.id,
      name: offer.name,
      link: offer.link,
      priceFreshold: offer.priceFreshold,
      currentPrice: currentPrise ?? 0,
    };
  }

  async findAll(): Promise<OfferResponseDto[]> {
    const offers = await this.database.offer.findMany();
    const result = await Promise.all(
      offers.map(async (offer) => {
        const currentPrise = await this.scraperService
          .scrapePrice(offer.link)
          .catch((error) => {
            console.error(
              `Błąd podczas skrapowania ceny dla linku ${offer.link}:`,
              error,
            );
          });
        return {
          id: offer.id,
          name: offer.name,
          link: offer.link,
          priceFreshold: offer.priceFreshold,
          currentPrice: currentPrise ?? 0,
        } as OfferResponseDto;
      }),
    );
    return result;
  }

  async findByUserEmail(userEmail: string) {
    const offers = await this.database.offer.findMany({
      where: {
        user: {
          email: userEmail,
        },
      },
    });
    const result = await Promise.all(
      offers.map(async (offer) => {
        const currentPrise = await this.scraperService
          .scrapePrice(offer.link)
          .catch((error) => {
            console.error(
              `Błąd podczas skrapowania ceny dla linku ${offer.link}:`,
              error,
            );
          });
        return {
          id: offer.id,
          name: offer.name,
          link: offer.link,
          priceFreshold: offer.priceFreshold,
          currentPrice: currentPrise ?? 0,
        } as OfferResponseDto;
      }),
    );
    return result;
  }

  async findOne(
    id: number,
    userEmail: string,
    role: Role,
  ): Promise<OfferResponseDto> {
    const offer = this.database.offer.findUnique({
      where: { id },
    }) as Promise<Offer>;
    if ((await offer) === null) {
      throw new NotFoundException(`Offer with id ${id.toString()} not found`);
    }

    if (role !== Role.ADMIN) {
      const offerUser = await this.database.user.findUnique({
        where: { id: (await offer).userId },
      });

      if (offerUser?.email !== userEmail) {
        throw new UnauthorizedException("this offer doesn't belong to you");
      }
    }
    return await offer.then(async (offer) => {
      const currentPrise = await this.scraperService
        .scrapePrice(offer.link)
        .catch((error) => {
          console.error(
            `Błąd podczas skrapowania ceny dla linku ${offer.link}:`,
            error,
          );
        });
      return {
        id: offer.id,
        name: offer.name,
        link: offer.link,
        priceFreshold: offer.priceFreshold,
        currentPrice: currentPrise ?? 0,
        offerHistories: (await this.database.priceHistory.findMany({
          where: { offerId: offer.id },
        })) as PriceHistory[],
      };
    });
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
    userEmail: string,
    role: Role,
  ): Promise<Offer> {
    const offer = await this.database.offer.findUnique({
      where: { id },
    });
    if (offer === null) {
      throw new NotFoundException(`Offer with id ${id.toString()} not found`);
    }

    if (role !== Role.ADMIN) {
      const user = await this.database.user.findUnique({
        where: { id: offer.userId },
      });
      if (user?.email !== userEmail) {
        throw new UnauthorizedException("this offer doesn't belong to you");
      }
    }

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

  async remove(id: number, userEmail: string, role: Role): Promise<Offer> {
    const offer = await this.database.offer.findUnique({
      where: { id },
    });
    if (offer === null) {
      throw new NotFoundException(`Offer with id ${id.toString()} not found`);
    }

    if (role !== Role.ADMIN) {
      const user = await this.database.user.findUnique({
        where: { id: offer.userId },
      });
      if (user?.email !== userEmail) {
        throw new UnauthorizedException("this offer doesn't belong to you");
      }
    }
    return await this.database.offer
      .delete({
        where: { id },
      })
      .catch(() => {
        throw new NotFoundException(`Offer with id ${id.toString()} not found`);
      });
  }
}
