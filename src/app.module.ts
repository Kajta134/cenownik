import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OfferModule } from './offer/offer.module.js';
import { ScraperModule } from './scrapers/scraper.module.js';
import { MailModule } from './mail/mail.module.js';

@Module({
  imports: [UserModule, AuthModule, OfferModule, ScraperModule, MailModule],
})
export class AppModule {}
