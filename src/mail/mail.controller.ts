import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Controller('test')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post('send-mail')
  async sendMail() {
    await this.mailService.sendMail(
      'kajtakamil1@gmail.com',
      'Test maila',
      'To jest testowy email',
      '<b>To jest testowy email</b>',
    );
    return { success: true };
  }
}
