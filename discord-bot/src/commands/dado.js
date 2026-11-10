import { SlashCommandBuilder } from 'discord.js';
import { random } from '../utils.js';

export default {
  category: '🎮 Diversión',
  data: new SlashCommandBuilder()
    .setName('dado')
    .setDescription('Tira un dado')
    .addIntegerOption((o) => o.setName('caras').setDescription('Cuántas caras (por defecto 6)').setMinValue(2).setMaxValue(1000)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('caras') ?? 6;
    await interaction.reply(`🎲 Tiraste un d${sides} y salió **${random(1, sides)}**`);
  },
};
