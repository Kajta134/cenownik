/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { OfferController } from './offer.controller.js';
import { OfferService } from './offer.service.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { Offer, Role } from '../generated/prisma/client.js';
import { UserMetadata } from '../user/dto/user-metadata.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AuthService } from '../auth/auth.service.js';

describe('OfferController', () => {
  let controller: OfferController;
  let service: jest.Mocked<OfferService>;

  const mockOffer: Offer = {
    id: 1,
    name: 'Test',
    link: 'http://example.com',
    userId: 1,
    priceFreshold: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OfferController>(OfferController);
    service = module.get(OfferService);
  });

  it('should create an offer', async () => {
    const dto: CreateOfferDto = {
      name: 'Test',
      link: 'http://example.com',
      priceFreshold: 50,
    };
    service.create.mockResolvedValue({
      name: dto.name,
      link: dto.link,
      priceFreshold: dto.priceFreshold,
      currentPrice: 45,
    });
    const userEmail = 'user@example.com';

    const result = await controller.create(
      {
        user: { email: userEmail, role: Role.USER } as UserMetadata,
      },
      dto,
    );

    expect(service.create).toHaveBeenCalledWith(dto, userEmail);
    expect(result).toEqual({
      name: dto.name,
      link: dto.link,
      priceFreshold: dto.priceFreshold,
      currentPrice: 45,
    });
  });

  it('should return all offers', async () => {
    service.findAll.mockResolvedValue([mockOffer]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockOffer]);
  });

  it('should return one offer by id', async () => {
    service.findOne.mockResolvedValue(mockOffer);

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockOffer);
  });

  it('should update an offer', async () => {
    const dto: UpdateOfferDto = { name: 'Updated' };
    service.update.mockResolvedValue({ ...mockOffer, ...dto });

    const result = await controller.update('1', dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ ...mockOffer, ...dto });
  });

  it('should remove an offer', async () => {
    service.remove.mockResolvedValue(mockOffer);

    const result = await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockOffer);
  });
});
