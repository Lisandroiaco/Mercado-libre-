// Sistema de niveles: XP por chatear (con 60s de espera entre mensajes que suman)
import { Events } from 'discord.js';
import { getUser, save } from '../db.js';
import { coin, random, xpForLevel } from '../utils.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const user = getUser(message.guild.id, message.author.id);
    if (Date.now() - user.lastXp < 60_000) return;

    user.lastXp = Date.now();
    user.xp += random(15, 25);

    let leveledUp = false;
    while (user.xp >= xpForLevel(user.level)) {
      user.xp -= xpForLevel(user.level);
      user.level += 1;
      leveledUp = true;
    }
    if (leveledUp) {
      const reward = user.level * 100;
      user.coins += reward;
      await message.channel
        .send(`🎉 ${message.author} subió a **nivel ${user.level}** y ganó **${reward}** ${coin}`)
        .catch(() => {});
    }
    save();
  },
};
