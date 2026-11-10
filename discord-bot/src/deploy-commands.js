// Registra los slash commands en Discord. Ejecutar con: npm run deploy
import { REST, Routes } from 'discord.js';
import { config, requireConfig } from './config.js';
import { loadModules } from './loader.js';

requireConfig('token', 'clientId');

const commands = (await loadModules('commands')).map((c) => c.data.toJSON());
const rest = new REST().setToken(config.token);

const route = config.guildId
  ? Routes.applicationGuildCommands(config.clientId, config.guildId)
  : Routes.applicationCommands(config.clientId);

await rest.put(route, { body: commands });
console.log(
  `✅ ${commands.length} comandos registrados ${
    config.guildId ? `en el servidor ${config.guildId}` : 'globalmente (puede tardar hasta 1 hora)'
  }.`,
);
