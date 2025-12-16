/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { Offer, PriceHistory, Role, User } from '../generated/prisma/client.js';
import { ScrapperService } from '../scrapers/scraper.service.js';
import { OfferResponseDto } from './dto/offer-response.dto.js';

describe('OfferService', () => {
  let service: OfferService;
  let prisma: jest.Mocked<PrismaService>;
  let scraperService: jest.Mocked<ScrapperService>;

  const sampleOffer = {
    id: 1,
    name: 'Test Offer',
    link: 'http://example.com',
    priceFreshold: 100,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Offer;

  const sampleUser = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com',
    password: 'password',
    scraperFrequency: 60,
    discordId: '1234567890',
    role: Role.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockCurrentPrice = 80;

  beforeEach(() => {
    prisma = {
      user: { findUnique: jest.fn() },
      offer: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      priceHistory: { findMany: jest.fn() },
    } as unknown as jest.Mocked<PrismaService>;
    scraperService = {
      scrapePrice: jest.fn(),
    } as unknown as jest.Mocked<ScrapperService>;
    service = new OfferService(prisma, scraperService);
  });

  describe('create', () => {
    it('creates offer when user exists', async () => {
      scraperService.scrapePrice.mockResolvedValue(mockCurrentPrice);
      prisma.user.findUnique.mockResolvedValue(sampleUser);
      prisma.offer.create.mockResolvedValue(sampleOffer);

      const dto: OfferResponseDto = {
        id: sampleOffer.id,
        name: sampleOffer.name,
        link: sampleOffer.link,
        priceFreshold: sampleOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
      };

      const result = await service.create(dto, sampleUser.email);

      expect(result).toEqual(dto);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: sampleUser.email },
      });
      expect(prisma.offer.create).toHaveBeenCalled();
      expect(scraperService.scrapePrice).toHaveBeenCalledWith(dto.link);
    });

    it('throws NotFound when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      scraperService.scrapePrice.mockResolvedValue(mockCurrentPrice);

      const dto: CreateOfferDto = {
        name: 'N',
        link: 'L',
        priceFreshold: 10,
      };

      await expect(
        service.create(dto, 'nonexistent@example.com'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all offers', async () => {
      prisma.offer.findMany.mockResolvedValue([sampleOffer]);
      scraperService.scrapePrice.mockResolvedValue(mockCurrentPrice);

      const sampleOfferResponse: OfferResponseDto = {
        id: sampleOffer.id,
        name: sampleOffer.name,
        link: sampleOffer.link,
        priceFreshold: sampleOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
      };
      const result = service.findAll();

      await expect(result).resolves.toEqual([sampleOfferResponse]);
      expect(prisma.offer.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns offer when found', async () => {
      prisma.offer.findUnique.mockResolvedValue({
        id: sampleOffer.id,
        name: sampleOffer.name,
        link: sampleOffer.link,
        priceFreshold: sampleOffer.priceFreshold,
        userId: sampleOffer.userId,
        createdAt: sampleOffer.createdAt,
        updatedAt: sampleOffer.updatedAt,
      } as Offer);
      prisma.user.findUnique.mockResolvedValue(sampleUser);

      prisma.priceHistory.findMany.mockResolvedValue([] as PriceHistory[]);

      scraperService.scrapePrice.mockResolvedValue(mockCurrentPrice);

      const result = service.findOne(1, sampleUser.email, sampleUser.role);

      await expect(result).resolves.toEqual({
        id: sampleOffer.id,
        name: sampleOffer.name,
        link: sampleOffer.link,
        priceFreshold: sampleOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
        offerHistories: [],
      } as OfferResponseDto);
      expect(prisma.offer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFound when missing', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne(2, sampleUser.email, sampleUser.role),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns offer', async () => {
      prisma.offer.update.mockResolvedValue(sampleOffer);
      prisma.user.findUnique.mockResolvedValue(sampleUser);
      prisma.offer.findUnique.mockResolvedValue(sampleOffer);

      const dto: UpdateOfferDto = {
        name: 'Updated',
        link: 'http://new',
        priceFreshold: 50,
      };
      const result = service.update(1, dto, sampleUser.email, sampleUser.role);

      await expect(result).resolves.toEqual(sampleOffer);
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: dto.name,
          link: dto.link,
          priceFreshold: dto.priceFreshold,
        },
      });
    });

    it('throws NotFound when update fails', async () => {
      prisma.offer.update.mockRejectedValue(new Error('not found'));
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.offer.findUnique.mockResolvedValue(null);

      const result = service.update(
        1,
        {} as UpdateOfferDto,
        sampleUser.email,
        sampleUser.role,
      );
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes offer', async () => {
      prisma.offer.delete.mockResolvedValue(sampleOffer);
      prisma.user.findUnique.mockResolvedValue(sampleUser);
      prisma.offer.findUnique.mockResolvedValue(sampleOffer);

      const result = service.remove(1, sampleUser.email, sampleUser.role);

      await expect(result).resolves.toEqual(sampleOffer);
      expect(prisma.offer.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFound when delete fails', async () => {
      prisma.offer.delete.mockRejectedValue(new Error('not found'));
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.offer.findUnique.mockResolvedValue(null);

      const result = service.remove(1, sampleUser.email, sampleUser.role);
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
