import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder, time } from 'discord.js';
import { getGuild, save } from '../db.js';
import { embed } from '../utils.js';

export default {
  category: '🛡️ Moderación',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Advertencias de miembros')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((s) =>
      s
        .setName('dar')
        .setDescription('Darle una advertencia a alguien')
        .addUserOption((o) => o.setName('usuario').setDescription('A quién').setRequired(true))
        .addStringOption((o) => o.setName('razon').setDescription('Por qué').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('ver')
        .setDescription('Ver las advertencias de alguien')
        .addUserOption((o) => o.setName('usuario').setDescription('De quién').setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName('borrar')
        .setDescription('Borrar todas las advertencias de alguien')
        .addUserOption((o) => o.setName('usuario').setDescription('De quién').setRequired(true)),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const warns = getGuild(interaction.guild.id).warns;
    const list = (warns[user.id] ??= []);

    switch (interaction.options.getSubcommand()) {
      case 'dar': {
        const razon = interaction.options.getString('razon');
        list.push({ by: interaction.user.id, reason: razon, at: Date.now() });
        save();
        await user.send(`⚠️ Recibiste una advertencia en **${interaction.guild.name}**: ${razon}`).catch(() => {});
        return interaction.reply(`⚠️ ${user} recibió una advertencia (**${list.length}** en total). Razón: ${razon}`);
      }
      case 'ver': {
        const lines = list.map((w, i) => `**${i + 1}.** ${w.reason} — por <@${w.by}> ${time(new Date(w.at), 'R')}`);
        return interaction.reply({
          embeds: [embed().setTitle(`Advertencias de ${user.username}`).setDescription(lines.join('\n') || 'Sin advertencias ✨')],
          allowedMentions: { parse: [] },
        });
      }
      case 'borrar':
        warns[user.id] = [];
        save();
        return interaction.reply(`🧽 Borré las advertencias de ${user}.`);
    }
  },
};
