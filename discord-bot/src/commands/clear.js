import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default {
  category: '🛡️ Moderación',
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Borra mensajes del canal (máx. 100, de menos de 14 días)')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cuántos').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `🧹 Borré **${deleted.size}** mensajes.`, flags: MessageFlags.Ephemeral });
  },
};
