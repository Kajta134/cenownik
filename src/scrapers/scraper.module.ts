import { Module } from '@nestjs/common';
import {
  PRICE_SCRAPER,
  PriceScraper,
  ScrapperService,
} from './scraper.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { XkomScraper } from './xkom.scraper.js';
import { OlxScraper } from './olx.scraper.js';
import { AmazonScraper } from './amazon.scraper.js';
import { MediaExpertScraper } from './media-expert.scraper.js';

@Module({
  providers: [
    ScrapperService,
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
  exports: [ScrapperService],
})
export class ScraperModule {}
