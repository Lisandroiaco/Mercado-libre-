import { MessageFlags } from 'discord.js';

// Comprueba que el moderador y el bot puedan actuar sobre el miembro
export async function getTarget(interaction, check) {
  const user = interaction.options.getUser('usuario');
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);
  const fail = (content) => interaction.reply({ content: `❌ ${content}`, flags: MessageFlags.Ephemeral }).then(() => null);

  if (user.id === interaction.user.id) return fail('No podés hacerte eso a vos mismo.');
  if (!member) return { user, member: null };
  if (interaction.member.roles.highest.position <= member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
    return fail('Esa persona tiene un rol igual o más alto que el tuyo.');
  }
  if (!member[check]) return fail('No tengo permisos suficientes (revisá que mi rol esté más arriba).');
  return { user, member };
}

export const reason = (interaction) => interaction.options.getString('razon') ?? 'Sin razón';
