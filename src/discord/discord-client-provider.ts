import { Client, GatewayIntentBits } from 'discord.js';

export const DiscordClientProvider = {
  provide: 'DISCORD_CLIENT',
  useFactory: async () => {
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    });

    await client.login(process.env.DISCORD_TOKEN);
    console.log('Discord bot zalogowany');

    return client;
  },
};
