import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getUser, save } from '../db.js';
import { coin, formatDuration, pick, random } from '../utils.js';

const COOLDOWN = 60 * 60 * 1000;
const jobs = [
  'programaste un bot de Discord',
  'repartiste pizzas bajo la lluvia',
  'hiciste de streamer por 3 horas',
  'paseaste 7 perros a la vez',
  'arreglaste la compu de tu tía',
  'vendiste empanadas en la plaza',
  'editaste un video para un youtuber',
];

export default {
  category: '💰 Economía',
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Trabajá para ganar monedas (cada 1 hora)')
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const user = getUser(interaction.guild.id, interaction.user.id);
    const left = user.lastWork + COOLDOWN - Date.now();
    if (left > 0) {
      return interaction.reply({ content: `😮‍💨 Estás cansado. Volvé a trabajar en **${formatDuration(left)}**.`, flags: MessageFlags.Ephemeral });
    }
    const earned = random(50, 150);
    user.lastWork = Date.now();
    user.coins += earned;
    save();
    await interaction.reply(`💼 ${pick(jobs)} y ganaste **${earned}** ${coin}.`);
  },
};
