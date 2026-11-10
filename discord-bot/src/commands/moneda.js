import { SlashCommandBuilder } from 'discord.js';

export default {
  category: '🎮 Diversión',
  data: new SlashCommandBuilder().setName('moneda').setDescription('Tira una moneda: cara o cruz'),
  async execute(interaction) {
    await interaction.reply(`🪙 Salió **${Math.random() < 0.5 ? 'cara' : 'cruz'}**`);
  },
};
