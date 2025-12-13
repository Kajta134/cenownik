import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller.js';
import { OfferService } from './offer.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ScraperModule } from '../scrapers/scraper.module.js';

@Module({
  controllers: [OfferController],
  providers: [OfferService],
  imports: [PrismaModule, AuthModule, ScraperModule],
})
export class OfferModule {}
