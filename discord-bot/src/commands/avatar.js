import { SlashCommandBuilder } from 'discord.js';
import { embed } from '../utils.js';

export default {
  category: '📌 Información',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra el avatar de alguien en grande')
    .addUserOption((o) => o.setName('usuario').setDescription('De quién')),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const url = user.displayAvatarURL({ size: 1024 });
    await interaction.reply({ embeds: [embed().setTitle(`Avatar de ${user.username}`).setURL(url).setImage(url)] });
  },
};
