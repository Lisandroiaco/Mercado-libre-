// Piedra, papel o tijera contra el bot, con botones
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { pick } from '../utils.js';

const moves = { piedra: '🪨', papel: '📄', tijera: '✂️' };
const beats = { piedra: 'tijera', papel: 'piedra', tijera: 'papel' };

export default {
  category: '🎮 Diversión',
  data: new SlashCommandBuilder().setName('ppt').setDescription('Jugá piedra, papel o tijera contra mí'),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      Object.entries(moves).map(([m, e]) =>
        new ButtonBuilder().setCustomId(`ppt:${m}:${interaction.user.id}`).setLabel(m).setEmoji(e).setStyle(ButtonStyle.Primary),
      ),
    );
    await interaction.reply({ content: '¿Qué elegís?', components: [row] });
  },
  async components(interaction, [move, ownerId]) {
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: 'Esta partida no es tuya, usá `/ppt` 😉', flags: MessageFlags.Ephemeral });
    }
    const bot = pick(Object.keys(moves));
    const result = move === bot ? '🤝 ¡Empate!' : beats[move] === bot ? '🎉 ¡Ganaste!' : '😈 ¡Gané yo!';
    await interaction.update({ content: `Vos: ${moves[move]} · Yo: ${moves[bot]}\n**${result}**`, components: [] });
  },
};
