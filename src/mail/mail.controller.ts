import { Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service.js';

@Controller('test')
export class MailController {
  constructor(private readonly mailService: MailService) {}
  @Post('send-mail')
  async sendMail() {
    await this.mailService.sendTestMail('kajtakamil1@gmail.com');
    return { success: true };
  }
}
