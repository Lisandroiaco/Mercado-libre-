import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getTarget, reason } from '../moderation.js';

export default {
  category: '🛡️ Moderación',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa a un miembro')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('A quién').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Por qué')),
  async execute(interaction) {
    const t = await getTarget(interaction, 'kickable');
    if (!t) return;
    if (!t.member) return interaction.reply('❌ Esa persona no está en el servidor.');
    await t.member.kick(reason(interaction));
    await interaction.reply(`👢 **${t.user.tag}** fue expulsado. Razón: ${reason(interaction)}`);
  },
};
