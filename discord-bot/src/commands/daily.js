import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getUser, save } from '../db.js';
import { coin, formatDuration } from '../utils.js';

const COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = 250;

export default {
  category: '💰 Economía',
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription(`Cobrá tu recompensa diaria (${REWARD} monedas)`)
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);
    const left = user.lastDaily + COOLDOWN - Date.now();
    if (left > 0) {
      return interaction.reply({ content: `⏳ Ya cobraste hoy. Volvé en **${formatDuration(left)}**.`, flags: MessageFlags.Ephemeral });
    }
    user.lastDaily = Date.now();
    user.coins += REWARD;
    save();
    await interaction.reply(`✅ Cobraste **${REWARD}** ${coin}. Ahora tenés **${user.coins}** ${coin}.`);
  },
};
