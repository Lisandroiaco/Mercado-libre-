// Confesiones anónimas: nadie ve quién la mandó
import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { config } from '../config.js';
import { embed } from '../utils.js';

let counter = 0;

export default {
  category: '🎉 Comunidad',
  data: new SlashCommandBuilder()
    .setName('confesar')
    .setDescription('Mandá una confesión anónima')
    .setContexts(InteractionContextType.Guild)
    .addStringOption((o) => o.setName('mensaje').setDescription('Tu confesión').setMaxLength(1500).setRequired(true)),
  async execute(interaction) {
    const channel = config.confessionsChannelId
      ? await interaction.guild.channels.fetch(config.confessionsChannelId).catch(() => null)
      : interaction.channel;
    if (!channel?.isTextBased()) {
      return interaction.reply({ content: '❌ El canal de confesiones no está bien configurado.', flags: MessageFlags.Ephemeral });
    }
    counter += 1;
    await channel.send({
      embeds: [embed().setTitle(`🤫 Confesión anónima #${counter}`).setDescription(interaction.options.getString('mensaje'))],
      allowedMentions: { parse: [] },
    });
    await interaction.reply({ content: '✅ Tu confesión se mandó de forma anónima.', flags: MessageFlags.Ephemeral });
  },
};
