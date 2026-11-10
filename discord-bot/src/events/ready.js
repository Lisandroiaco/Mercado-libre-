import { ActivityType, Events } from 'discord.js';
import { giveaways } from '../db.js';
import { scheduleGiveaway } from '../commands/sorteo.js';

export default {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.user.setActivity('/help', { type: ActivityType.Listening });
    for (const id of Object.keys(giveaways)) scheduleGiveaway(client, id);
    console.log(`🤖 Conectado como ${client.user.tag} en ${client.guilds.cache.size} servidores`);
  },
};
