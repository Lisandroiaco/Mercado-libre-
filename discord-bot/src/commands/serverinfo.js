import { InteractionContextType, SlashCommandBuilder, time } from 'discord.js';
import { embed } from '../utils.js';

export default {
  category: '📌 Información',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información del servidor')
    .setContexts(InteractionContextType.Guild),
  async execute(interaction) {
    const g = interaction.guild;
    const owner = await g.fetchOwner();
    await interaction.reply({
      embeds: [
        embed()
          .setTitle(g.name)
          .setThumbnail(g.iconURL({ size: 256 }))
          .addFields(
            { name: 'Dueño', value: `${owner.user}`, inline: true },
            { name: 'Miembros', value: `${g.memberCount}`, inline: true },
            { name: 'Canales', value: `${g.channels.cache.size}`, inline: true },
            { name: 'Roles', value: `${g.roles.cache.size}`, inline: true },
            { name: 'Boosts', value: `${g.premiumSubscriptionCount ?? 0}`, inline: true },
            { name: 'Creado', value: time(g.createdAt, 'R'), inline: true },
          )
          .setFooter({ text: `ID: ${g.id}` }),
      ],
    });
  },
};
