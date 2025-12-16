import { Controller, Post } from '@nestjs/common';
import { DiscordService } from './discord.service.js';

@Controller('test')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}
  @Post('discord-test-send-message')
  async sendDiscordMessage() {
    await this.discordService.sendMessage(
      '583692077913866260',
      'Testowa wiadomość z bota Discord',
    );
    return { success: true };
  }
}
