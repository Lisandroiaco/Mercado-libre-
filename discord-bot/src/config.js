import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || null,
  confessionsChannelId: process.env.CONFESSIONS_CHANNEL_ID || null,
  embedColor: process.env.EMBED_COLOR || '#5865F2',
};

export function requireConfig(...keys) {
  const missing = keys.filter((k) => !config[k]);
  if (missing.length) {
    console.error(`Faltan variables en .env: ${missing.join(', ')}`);
    process.exit(1);
  }
}
