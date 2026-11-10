import { SlashCommandBuilder } from 'discord.js';

export default {
  category: '🛠️ Utilidad',
  data: new SlashCommandBuilder().setName('ping').setDescription('Muestra la latencia del bot'),
  async execute(interaction, client) {
    const { resource } = await interaction.reply({ content: '🏓 Calculando...', withResponse: true });
    const roundtrip = resource.message.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Mensaje: **${roundtrip} ms** · API: **${client.ws.ping} ms**`);
  },
};
