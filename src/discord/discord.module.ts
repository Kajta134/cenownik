import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service.js';
import { DiscordClientProvider } from './discord-client-provider.js';
import { DiscordController } from './discord.controller.js';

@Module({
  providers: [DiscordService, DiscordClientProvider],
  exports: [DiscordService],
  controllers: [DiscordController],
})
export class DiscordModule {}
