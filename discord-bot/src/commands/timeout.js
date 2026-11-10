import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getTarget, reason } from '../moderation.js';

export default {
  category: '🛡️ Moderación',
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Silencia a un miembro por un tiempo (0 para quitarlo)')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('A quién').setRequired(true))
    .addIntegerOption((o) => o.setName('minutos').setDescription('Duración').setMinValue(0).setMaxValue(40320).setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Por qué')),
  async execute(interaction) {
    const t = await getTarget(interaction, 'moderatable');
    if (!t) return;
    if (!t.member) return interaction.reply('❌ Esa persona no está en el servidor.');
    const minutes = interaction.options.getInteger('minutos');
    await t.member.timeout(minutes ? minutes * 60_000 : null, reason(interaction));
    await interaction.reply(
      minutes ? `🔇 **${t.user.tag}** silenciado por **${minutes} min**. Razón: ${reason(interaction)}` : `🔊 Le quité el silencio a **${t.user.tag}**.`,
    );
  },
};
