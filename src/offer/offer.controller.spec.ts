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

  const mockUser: UserMetadata = {
    email: 'user@example.com',
    role: Role.ADMIN,
  };

  const mockCurrentPrice = 45;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfferController],
      providers: [
        {
          provide: OfferService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByUserEmail: jest.fn(),
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
      id: 1,
      name: dto.name,
      link: dto.link,
      priceFreshold: dto.priceFreshold,
      currentPrice: mockCurrentPrice,
    });

    const result = await controller.create(
      {
        user: mockUser,
      },
      dto,
    );

    const createSpy = jest.spyOn(service, 'create');
    expect(createSpy).toHaveBeenCalledWith(dto, mockUser.email);
    expect(result).toEqual({
      id: 1,
      name: dto.name,
      link: dto.link,
      priceFreshold: dto.priceFreshold,
      currentPrice: mockCurrentPrice,
    });
  });

  it('should return all offers', async () => {
    service.findAll.mockResolvedValue([
      {
        id: mockOffer.id,
        name: mockOffer.name,
        link: mockOffer.link,
        priceFreshold: mockOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
      },
    ]);

    service.findByUserEmail.mockResolvedValue([
      {
        id: mockOffer.id,
        name: mockOffer.name,
        link: mockOffer.link,
        priceFreshold: mockOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
      },
    ]);
    const result = await controller.findAll({
      user: mockUser,
    });

    const findAllSpy = jest.spyOn(service, 'findAll');
    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        id: mockOffer.id,
        name: mockOffer.name,
        link: mockOffer.link,
        priceFreshold: mockOffer.priceFreshold,
        currentPrice: mockCurrentPrice,
      },
    ]);
  });

  it('should return one offer by id', async () => {
    service.findOne.mockResolvedValue({
      id: mockOffer.id,
      name: mockOffer.name,
      link: mockOffer.link,
      priceFreshold: mockOffer.priceFreshold,
      currentPrice: mockCurrentPrice,
    });

    const result = await controller.findOne('1', {
      user: mockUser,
    });

    const findOneSpy = jest.spyOn(service, 'findOne');
    expect(findOneSpy).toHaveBeenCalledWith(1, mockUser.email, mockUser.role);
    expect(result).toEqual({
      id: mockOffer.id,
      name: mockOffer.name,
      link: mockOffer.link,
      priceFreshold: mockOffer.priceFreshold,
      currentPrice: mockCurrentPrice,
    });
  });

  it('should update an offer', async () => {
    const dto: UpdateOfferDto = { name: 'Updated' };
    service.update.mockResolvedValue({ ...mockOffer, ...dto });

    const result = await controller.update('1', dto, {
      user: mockUser,
    });

    const updateSpy = jest.spyOn(service, 'update');
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      dto,
      mockUser.email,
      mockUser.role,
    );
    expect(result).toEqual({ ...mockOffer, ...dto });
  });

  it('should remove an offer', async () => {
    service.remove.mockResolvedValue(mockOffer);

    const result = await controller.remove('1', {
      user: mockUser,
    });
    const removeSpy = jest.spyOn(service, 'remove');
    expect(removeSpy).toHaveBeenCalledWith(1, mockUser.email, mockUser.role);
    expect(result).toEqual(mockOffer);
  });
});
