import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { getUser } from '../db.js';
import { embed, xpForLevel } from '../utils.js';

function bar(current, total, size = 14) {
  const filled = Math.round((current / total) * size);
  return '▰'.repeat(filled) + '▱'.repeat(size - filled);
}

export default {
  category: '⭐ Niveles',
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Mirá tu nivel y experiencia')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((o) => o.setName('usuario').setDescription('De quién')),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const d = getUser(interaction.guild.id, user.id);
    const need = xpForLevel(d.level);
    await interaction.reply({
      embeds: [
        embed()
          .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
          .setDescription(`**Nivel ${d.level}**\n${bar(d.xp, need)} ${d.xp}/${need} XP`)
          .setFooter({ text: 'Ganás XP chateando en el servidor' }),
      ],
    });
  },
};
