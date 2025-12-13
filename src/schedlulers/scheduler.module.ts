import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { OfferAlertScheduler } from './offer-alert.scheduler.js';
import { MailModule } from '../mail/mail.module.js';
import { ScraperModule } from '../scrapers/scraper.module.js';

@Module({
  imports: [PrismaModule, MailModule, ScraperModule, ScheduleModule.forRoot()],
  providers: [OfferAlertScheduler],
})
export class SchedulerModule {}
