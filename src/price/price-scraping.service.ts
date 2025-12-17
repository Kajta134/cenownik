import { Inject, Injectable } from '@nestjs/common';

export const PRICE_SCRAPER = 'PRICE_SCRAPER';

export interface PriceScraper {
  canHandle(url: string): boolean;
  scrape(url: string): Promise<number | null>;
}

@Injectable()
export class PriceScrapingService {
  constructor(
    @Inject(PRICE_SCRAPER) private readonly scrapers: PriceScraper[],
  ) {}

  async scrapePrice(url: string) {
    const scraper = this.scrapers.find((s) => s.canHandle(url));
    return scraper ? scraper.scrape(url) : null;
  }
}
