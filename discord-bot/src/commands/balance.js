import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { getUser } from '../db.js';
import { coin, embed } from '../utils.js';

export default {
  category: '💰 Economía',
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mirá cuántas monedas tenés')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((o) => o.setName('usuario').setDescription('De quién')),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const data = getUser(interaction.guild.id, user.id);
    await interaction.reply({
      embeds: [embed().setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setDescription(`${coin} **${data.coins.toLocaleString('es')}** monedas`)],
    });
  },
};
