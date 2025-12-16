import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { OfferModule } from './offer/offer.module.js';
import { ScraperModule } from './scrapers/scraper.module.js';
import { MailModule } from './mail/mail.module.js';
import { SchedulerModule } from './schedlulers/scheduler.module.js';
import { DiscordModule } from './discord/discord.module.js';

@Module({
  imports: [
    UserModule,
    AuthModule,
    OfferModule,
    ScraperModule,
    MailModule,
    SchedulerModule,
    DiscordModule,
  ],
})
export class AppModule {}
