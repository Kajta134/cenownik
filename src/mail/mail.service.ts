import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendTestMail(to: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Test maila',
      text: 'To jest testowy email',
      html: '<b>To jest testowy email</b>',
    });
  }
}
