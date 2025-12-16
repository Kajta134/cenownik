import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { scrapeAmazon } from './amazon.scraper.js';
import { scrapeOlx } from './olx.scraper.js';
import { scrapeMediaExpert } from './media-expert.scraper.js';
import { scrapeXkom } from './xkom.scraper.js';

@Injectable()
export class ScrapperService {
  constructor(private database: PrismaService) {}

  async scrapePrice(link: string): Promise<number | null> {
    switch (true) {
      case link.includes('amazon'):
        return await scrapeAmazon(link);
      case link.includes('olx'):
        return await scrapeOlx(link);
      case link.includes('mediaexpert'):
        return await scrapeMediaExpert(link);
      case link.includes('x-kom.pl'):
        return await scrapeXkom(link);
      default:
        return null;
    }
  }
}
