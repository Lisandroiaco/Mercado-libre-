import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { getGuild } from '../db.js';
import { coin, embed } from '../utils.js';

const medals = ['🥇', '🥈', '🥉'];

export default {
  category: '⭐ Niveles',
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Ranking del servidor')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((o) =>
      o.setName('por').setDescription('Ordenar por').addChoices({ name: 'Nivel', value: 'level' }, { name: 'Monedas', value: 'coins' }),
    ),
  async execute(interaction) {
    const by = interaction.options.getString('por') ?? 'level';
    const users = Object.entries(getGuild(interaction.guild.id).users)
      .sort(([, a], [, b]) => (by === 'level' ? b.level - a.level || b.xp - a.xp : b.coins - a.coins))
      .slice(0, 10);

    const lines = users.map(([id, u], i) => {
      const value = by === 'level' ? `Nivel ${u.level}` : `${u.coins} ${coin}`;
      return `${medals[i] ?? `**${i + 1}.**`} <@${id}> — ${value}`;
    });
    await interaction.reply({
      embeds: [embed().setTitle(`🏆 Top ${by === 'level' ? 'niveles' : 'monedas'}`).setDescription(lines.join('\n') || 'Todavía no hay nadie 👀')],
      allowedMentions: { parse: [] },
    });
  },
};
