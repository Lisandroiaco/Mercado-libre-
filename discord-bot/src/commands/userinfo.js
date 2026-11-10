import { SlashCommandBuilder, time } from 'discord.js';
import { embed } from '../utils.js';

export default {
  category: '📌 Información',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información de un usuario')
    .addUserOption((o) => o.setName('usuario').setDescription('Usuario a consultar')),
  async execute(interaction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    const e = embed()
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Cuenta creada', value: time(user.createdAt, 'R'), inline: true },
      );
    if (member) {
      const roles = member.roles.cache.filter((r) => r.id !== interaction.guild.id);
      e.addFields(
        { name: 'Se unió', value: time(member.joinedAt, 'R'), inline: true },
        { name: `Roles (${roles.size})`, value: roles.map((r) => `${r}`).slice(0, 20).join(' ') || 'Ninguno' },
      );
    }
    await interaction.reply({ embeds: [e] });
  },
};
