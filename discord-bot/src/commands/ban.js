import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getTarget, reason } from '../moderation.js';

export default {
  category: '🛡️ Moderación',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banea a un usuario')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName('usuario').setDescription('A quién').setRequired(true))
    .addStringOption((o) => o.setName('razon').setDescription('Por qué')),
  async execute(interaction) {
    const t = await getTarget(interaction, 'bannable');
    if (!t) return;
    await interaction.guild.members.ban(t.user, { reason: reason(interaction) });
    await interaction.reply(`🔨 **${t.user.tag}** fue baneado. Razón: ${reason(interaction)}`);
  },
};
