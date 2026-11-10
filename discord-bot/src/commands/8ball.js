import { SlashCommandBuilder } from 'discord.js';
import { embed, pick } from '../utils.js';

const answers = [
  'Sí, obvio 😎', 'Ni en pedo 🙅', 'Puede ser...', 'Preguntá de nuevo más tarde',
  'Las estrellas dicen que sí ✨', 'Mmm, no lo veo', 'Sin dudas', 'Mejor no te digo ahora',
  'Clarísimo que sí', 'Ni lo sueñes', 'Todo indica que sí', 'Muy dudoso 🤨',
];

export default {
  category: '🎮 Diversión',
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Hacele una pregunta a la bola mágica')
    .addStringOption((o) => o.setName('pregunta').setDescription('Tu pregunta').setRequired(true)),
  async execute(interaction) {
    await interaction.reply({
      embeds: [embed().setTitle('🎱 Bola mágica').addFields(
        { name: 'Pregunta', value: interaction.options.getString('pregunta') },
        { name: 'Respuesta', value: pick(answers) },
      )],
    });
  },
};
