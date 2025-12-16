import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client, DiscordAPIError } from 'discord.js';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  constructor(
    @Inject('DISCORD_CLIENT')
    private readonly client: Client,
  ) {}

  sendDiscordActivationLink(): string {
    const LINK_TO_DISCORD_SERVER =
      'https://discord.com/oauth2/authorize?client_id=1450490047831867402&permissions=67584&integration_type=0&scope=bot+applications.commands';
    return LINK_TO_DISCORD_SERVER;
  }

  async sendMessage(
    userId: string,
    message: string,
  ): Promise<{ ok: boolean; reason?: string }> {
    try {
      const user = await this.client.users.fetch(userId);
      await user.send(message);
      return { ok: true };
    } catch (error: any) {
      if (error instanceof DiscordAPIError && error.code === 50007) {
        this.logger.warn(`DM blocked for user ${userId} (code 50007)`);
        return { ok: false, reason: 'DM_BLOCKED' };
      }

      this.logger.error(`Discord error for user ${userId}`, error);
      throw error;
    }
  }

  async sendOfferPriceAlertDiscordMessage(
    userId: string,
    offerLink: string,
    currentPrice: number,
    priceThreshold: number,
  ): Promise<void> {
    const message =
      `Cena oferty pod linkiem ${offerLink} ` +
      `spadła poniżej wyznaczonej przez Ciebie wartości: ${priceThreshold}. ` +
      `Teraz wynosi ${currentPrice}. Sprawdź ją teraz!`;

    const result = await this.sendMessage(userId, message);

    if (!result.ok) {
      this.logger.warn(
        `Offer price alert not delivered to ${userId}: ${result.reason}`,
      );
    }
  }

  async sendOfferRemovedDiscordMessage(
    userId: string,
    offerLink: string,
  ): Promise<void> {
    const message =
      `Twoja oferta pod linkiem ${offerLink} została usunięta, ` +
      `ponieważ nie jest już dostępna.`;

    const result = await this.sendMessage(userId, message);

    if (!result.ok) {
      this.logger.warn(
        `Offer removed message not delivered to ${userId}: ${result.reason}`,
      );
    }
  }
}
