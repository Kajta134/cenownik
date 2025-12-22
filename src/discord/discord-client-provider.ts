import { Client, GatewayIntentBits } from 'discord.js';

export const DiscordClientProvider = {
  provide: 'DISCORD_CLIENT',
  useFactory: async () => {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    });

    await client.login(process.env.DISCORD_TOKEN);
    console.log('Discord bot zalogowany');

    return client;
  },
};
