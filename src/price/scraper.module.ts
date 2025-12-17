import { Module } from '@nestjs/common';
import {
  PRICE_SCRAPER,
  PriceScraper,
  PriceScrapingService,
} from './price-scraping.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { XkomScraper } from './scrapers/xkom.scraper.js';
import { OlxScraper } from './scrapers/olx.scraper.js';
import { AmazonScraper } from './scrapers/amazon.scraper.js';
import { MediaExpertScraper } from './scrapers/media-expert.scraper.js';

@Module({
  providers: [
    PriceScrapingService,
    AmazonScraper,
    OlxScraper,
    MediaExpertScraper,
    XkomScraper,
    {
      provide: PRICE_SCRAPER,
      useFactory: (
        amazonScraper: AmazonScraper,
        olxScraper: OlxScraper,
        mediaExpertScraper: MediaExpertScraper,
        xkomScraper: XkomScraper,
      ): PriceScraper[] => [
        amazonScraper,
        olxScraper,
        mediaExpertScraper,
        xkomScraper,
      ],
      inject: [AmazonScraper, OlxScraper, MediaExpertScraper, XkomScraper],
    },
  ],
  imports: [PrismaModule],
  exports: [PriceScrapingService],
})
export class ScraperModule {}
