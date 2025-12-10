/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { OfferService } from './offer.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { Offer, Role, User } from '../generated/prisma/client.js';

describe('OfferService', () => {
  let service: OfferService;
  let prisma: jest.Mocked<PrismaService>;

  const sampleOffer = {
    id: 1,
    name: 'Test Offer',
    link: 'http://example.com',
    priceFreshold: 100,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Offer;

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
    } as unknown as jest.Mocked<PrismaService>;
    service = new OfferService(prisma);
  });

  describe('create', () => {
    it('creates offer when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'user@example.com',
        password: 'password',
        role: Role.USER,
        isActive: true,

        createdAt: new Date(),
        updatedAt: new Date(),
      } as User);
      prisma.offer.create.mockResolvedValue(sampleOffer);

      const dto: CreateOfferDto = {
        name: sampleOffer.name,
        link: sampleOffer.link,
        priceFreshold: sampleOffer.priceFreshold,
        userId: sampleOffer.userId,
      };

      await expect(service.create(dto)).resolves.toEqual(sampleOffer);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: dto.userId },
      });
      expect(prisma.offer.create).toHaveBeenCalled();
    });

    it('throws NotFound when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const dto: CreateOfferDto = {
        name: 'N',
        link: 'L',
        priceFreshold: 10,
        userId: 999,
      };

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('returns all offers', async () => {
      prisma.offer.findMany.mockResolvedValue([sampleOffer]);

      await expect(service.findAll()).resolves.toEqual([sampleOffer]);
      expect(prisma.offer.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns offer when found', async () => {
      prisma.offer.findUnique.mockResolvedValue(sampleOffer);

      await expect(service.findOne(1)).resolves.toEqual(sampleOffer);
      expect(prisma.offer.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('throws NotFound when missing', async () => {
      prisma.offer.findUnique.mockResolvedValue(null);

      await expect(service.findOne(2)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates and returns offer', async () => {
      prisma.offer.update.mockResolvedValue(sampleOffer);

      const dto: UpdateOfferDto = {
        name: 'Updated',
        link: 'http://new',
        priceFreshold: 50,
        userId: 2,
      };

      await expect(service.update(1, dto)).resolves.toEqual(sampleOffer);
      expect(prisma.offer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: dto.name,
          link: dto.link,
          priceFreshold: dto.priceFreshold,
          userId: dto.userId,
        },
      });
    });

    it('throws NotFound when update fails', async () => {
      prisma.offer.update.mockRejectedValue(new Error('not found'));

      await expect(
        service.update(1, {} as UpdateOfferDto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes offer', async () => {
      prisma.offer.delete.mockResolvedValue(sampleOffer);

      await expect(service.remove(1)).resolves.toEqual(sampleOffer);
      expect(prisma.offer.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('throws NotFound when delete fails', async () => {
      prisma.offer.delete.mockRejectedValue(new Error('not found'));

      await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
