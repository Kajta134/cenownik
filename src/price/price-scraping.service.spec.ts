/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import {
  PRICE_SCRAPER,
  PriceScraper,
  PriceScrapingService,
} from './price-scraping.service.js';

describe('PriceScrapingService', () => {
  let service: PriceScrapingService;

  const amazonMock: PriceScraper = {
    canHandle: jest.fn((url: string) => url.includes('amazon')) as (
      url: string,
    ) => boolean,
    scrape: jest.fn().mockResolvedValue(100 as never) as (
      url: string,
    ) => Promise<number | null>,
  };

  const olxMock: PriceScraper = {
    canHandle: jest.fn((url: string) => url.includes('olx')) as (
      url: string,
    ) => boolean,
    scrape: jest.fn().mockResolvedValue(200 as never) as (
      url: string,
    ) => Promise<number | null>,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PriceScrapingService,
        {
          provide: PRICE_SCRAPER,
          useValue: [amazonMock, olxMock],
        },
      ],
    }).compile();

    service = module.get(PriceScrapingService);
  });

  it('returns price from matching source', async () => {
    const price = await service.scrapePrice('https://amazon.com/item');

    expect(price).toBe(100);
    expect(amazonMock.scrape).toHaveBeenCalled();
    expect(olxMock.scrape).not.toHaveBeenCalled();
  });

  it('returns null when no source matches', async () => {
    const price = await service.scrapePrice('https://unknown.com');
    expect(price).toBeNull();
  });
});
