import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getUser, save } from '../db.js';
import { coin } from '../utils.js';

export default {
  category: '💰 Economía',
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Transferile monedas a alguien')
    .setContexts(InteractionContextType.Guild)
    .addUserOption((o) => o.setName('usuario').setDescription('A quién').setRequired(true))
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cuánto').setMinValue(1).setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('usuario');
    const amount = interaction.options.getInteger('cantidad');
    if (target.bot || target.id === interaction.user.id) {
      return interaction.reply({ content: '❌ No podés pagarte a vos mismo ni a un bot.', flags: MessageFlags.Ephemeral });
    }
    const from = getUser(interaction.guild.id, interaction.user.id);
    if (from.coins < amount) {
      return interaction.reply({ content: `❌ No te alcanza. Tenés **${from.coins}** ${coin}.`, flags: MessageFlags.Ephemeral });
    }
    from.coins -= amount;
    getUser(interaction.guild.id, target.id).coins += amount;
    save();
    await interaction.reply(`💸 ${interaction.user} le pasó **${amount}** ${coin} a ${target}.`);
  },
};
