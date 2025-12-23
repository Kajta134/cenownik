import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('MAIL credentials missing');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await this.transporter.sendMail({
        from: `"My App" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Nie udało się wysłać maila');
    }
  }

  async sendOfferPriceAlertEmail(
    to: string,
    offerLink: string,
    currentPrice: number,
    priceThreshold: number,
  ) {
    const subject = 'Alert cenowy oferty';
    const text = `Cena oferty pod linkiem ${offerLink} spadła ponizej wyznaczoej przez Ciebie wartości:${priceThreshold}. Teraz wynosi ${currentPrice}. Sprawdź ją teraz!`;
    await this.sendMail(to, subject, text);
  }

  async sendOfferRemovedEmail(to: string, offerLink: string) {
    const subject = 'Oferta usunięta';
    const text = `Twoja oferta pod linkiem ${offerLink} została usunięta, ponieważ nie jest już dostępna.`;
    await this.sendMail(to, subject, text);
  }
}
