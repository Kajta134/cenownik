import { jest } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service.js';
import { OfferAlertScheduler } from './offer-alert.scheduler.js';
import { MailService } from '../mail/mail.service.js';
import { PriceScrapingService } from '../price/price-scraping.service.js';
import { DiscordService } from '../discord/discord.service.js';
import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistory, Role, User } from '../generated/prisma/client.js';

describe('OfferAlertScheduler', () => {
  let scheduler: OfferAlertScheduler;
  let prisma: jest.Mocked<PrismaService>;
  let mailService: jest.Mocked<MailService>;
  let scraperService: jest.Mocked<PriceScrapingService>;
  let discordService: jest.Mocked<DiscordService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferAlertScheduler,
        {
          provide: PrismaService,
          useValue: {
            offer: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
            user: {
              findMany: jest.fn(),
            },
            priceHistory: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: MailService,
          useValue: {
            sendOfferPriceAlertEmail: jest.fn(),
            sendOfferRemovedEmail: jest.fn(),
          },
        },
        {
          provide: PriceScrapingService,
          useValue: {
            scrapePrice: jest.fn(),
          },
        },
        {
          provide: DiscordService,
          useValue: {
            sendOfferPriceAlertDiscordMessage: jest.fn(),
            sendOfferRemovedDiscordMessage: jest.fn(),
          },
        },
      ],
    }).compile();
    scheduler = module.get<OfferAlertScheduler>(OfferAlertScheduler);
    prisma = module.get(PrismaService);
    mailService = module.get(MailService);
    scraperService = module.get(PriceScrapingService);
    discordService = module.get(DiscordService);
  });
  it('should be defined', () => {
    expect(scheduler).toBeDefined();
  });

  it('should send alerts for offers below threshold', async () => {
    const mockOffers = [
      {
        id: 1,
        name: 'Offer 1',
        link: 'http://example.com/1',
        userId: 1,
        priceFreshold: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          email: 'user@example.com',
        },
      },
    ];
    prisma.offer.findMany.mockResolvedValue(mockOffers);
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        scraperFrequency: 1,
        discordId: '1234567890',
        role: Role.USER,
        isActive: true,
      },
    ];
    prisma.user.findMany.mockResolvedValue(mockUsers);
    prisma.priceHistory.create.mockResolvedValue({} as PriceHistory);
    scraperService.scrapePrice.mockResolvedValue(90);
    await scheduler.handleOfferAlerts();

    const sendOfferPriceAlertEmailSpy = jest.spyOn(
      mailService,
      'sendOfferPriceAlertEmail',
    );
    expect(sendOfferPriceAlertEmailSpy).toHaveBeenCalledWith(
      'user@example.com',
      'http://example.com/1',
      90,
      100,
    );
    const sendOfferPriceAlertDiscordMessageSpy = jest.spyOn(
      discordService,
      'sendOfferPriceAlertDiscordMessage',
    );
    expect(sendOfferPriceAlertDiscordMessageSpy).toHaveBeenCalledWith(
      mockUsers[0].discordId,
      'http://example.com/1',
      90,
      100,
    );
  });
});
