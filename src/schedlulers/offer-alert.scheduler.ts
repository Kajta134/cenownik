import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ScrapperService } from '../scrapers/scraper.service.js';

@Injectable()
export class OfferAlertScheduler {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private scraperService: ScrapperService,
  ) {
    this.timer = 0;
  }
  timer: number;

  @Cron(CronExpression.EVERY_MINUTE)
  async handleOfferAlerts() {
    this.timer += 1;
    const users = await this.prisma.user.findMany();

    for (const user of users) {
      if (this.timer % user.scraperFrequency !== 0) {
        continue;
      }
      const offers = await this.prisma.offer.findMany({
        where: { userId: user.id },
      });
      for (const offer of offers) {
        const currentPrice = await this.scraperService.scrapePrice(offer.link);
        if (currentPrice === null) {
          await this.prisma.offer.delete({ where: { id: offer.id } });
          await this.mailService.sendOfferRemovedEmail(user.email, offer.link);
        } else if (currentPrice < offer.priceFreshold) {
          await this.mailService.sendOfferPriceAlertEmail(
            user.email,
            offer.link,
            currentPrice,
            offer.priceFreshold,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  resetTimer() {
    this.timer = 0;
  }
}
