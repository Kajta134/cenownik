import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { scrapeAmazon } from './amazon.scraper.js';
import { scrapeOlx } from './olx.scraper.js';

@Injectable()
export class ScrapperService {
  constructor(private database: PrismaService) {}

  async scrapePrice(link: string): Promise<number> {
    switch (true) {
      case link.includes('amazon'):
        return await scrapeAmazon(link);
      case link.includes('olx'):
        return await scrapeOlx(link);
      default:
        throw new Error('No scraper available for the provided link');
    }
  }
}
