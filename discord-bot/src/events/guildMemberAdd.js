import { EmbedBuilder, Events } from 'discord.js';
import { config } from '../config.js';

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    if (!config.welcomeChannelId) return;
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`¡Bienvenido/a a ${member.guild.name}!`)
      .setDescription(`Hola ${member}, ya somos **${member.guild.memberCount}** miembros 🎉`)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  },
};
