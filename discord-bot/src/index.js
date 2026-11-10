import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config, requireConfig } from './config.js';
import { loadModules } from './loader.js';

requireConfig('token');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers, // bienvenidas (activar "Server Members Intent" en el portal)
    GatewayIntentBits.GuildMessages, // niveles por chatear
  ],
  partials: [Partials.GuildMember],
});

client.commands = new Collection();
for (const command of await loadModules('commands')) {
  client.commands.set(command.data.name, command);
}

for (const event of await loadModules('events')) {
  const handler = (...args) => event.execute(...args, client);
  if (event.once) client.once(event.name, handler);
  else client.on(event.name, handler);
}

client.login(config.token);
