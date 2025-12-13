import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OfferModule } from './offer/offer.module.js';
import { ScraperModule } from './scrapers/scraper.module.js';

@Module({
  imports: [UserModule, AuthModule, OfferModule, ScraperModule],
})
export class AppModule {}
