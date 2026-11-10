// Sorteos con botón para participar. Sobreviven a reinicios del bot.
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, time } from 'discord.js';
import { giveaways, save } from '../db.js';
import { embed } from '../utils.js';

function render(g, ended = false) {
  const e = embed().setTitle(`🎁 Sorteo: ${g.prize}`).addFields(
    { name: ended ? 'Terminó' : 'Termina', value: time(new Date(g.endsAt), 'R'), inline: true },
    { name: 'Participantes', value: `${g.entries.length}`, inline: true },
    { name: 'Ganadores', value: `${g.winners}`, inline: true },
  );
  if (ended) e.setDescription(g.result);
  return e;
}

const button = (disabled = false) =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('sorteo:join').setLabel('Participar').setEmoji('🎉').setStyle(ButtonStyle.Success).setDisabled(disabled),
  );

async function finish(client, messageId) {
  const g = giveaways[messageId];
  if (!g) return;
  delete giveaways[messageId];
  save();

  const pool = [...g.entries];
  const winners = [];
  while (winners.length < g.winners && pool.length) winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  g.result = winners.length ? `🏆 Ganador(es): ${winners.map((id) => `<@${id}>`).join(', ')}` : 'Nadie participó 😢';

  const channel = await client.channels.fetch(g.channelId).catch(() => null);
  const message = await channel?.messages.fetch(messageId).catch(() => null);
  await message?.edit({ embeds: [render(g, true)], components: [button(true)] });
  await channel?.send(winners.length ? `🎉 ¡Felicitaciones ${winners.map((id) => `<@${id}>`).join(', ')}! Ganaste **${g.prize}**` : `El sorteo de **${g.prize}** terminó sin participantes.`);
}

export function scheduleGiveaway(client, messageId) {
  const g = giveaways[messageId];
  if (!g) return;
  // setTimeout acepta hasta ~24 días; si es más largo se reprograma en etapas
  const delay = Math.min(Math.max(g.endsAt - Date.now(), 0), 2 ** 31 - 1);
  setTimeout(() => (Date.now() >= g.endsAt ? finish(client, messageId) : scheduleGiveaway(client, messageId)), delay);
}

export default {
  category: '🎉 Comunidad',
  data: new SlashCommandBuilder()
    .setName('sorteo')
    .setDescription('Arma un sorteo con botón para participar')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) => o.setName('premio').setDescription('Qué se sortea').setRequired(true))
    .addIntegerOption((o) => o.setName('minutos').setDescription('Cuánto dura').setMinValue(1).setMaxValue(43200).setRequired(true))
    .addIntegerOption((o) => o.setName('ganadores').setDescription('Cuántos ganan (por defecto 1)').setMinValue(1).setMaxValue(20)),
  async execute(interaction, client) {
    const g = {
      prize: interaction.options.getString('premio'),
      winners: interaction.options.getInteger('ganadores') ?? 1,
      endsAt: Date.now() + interaction.options.getInteger('minutos') * 60_000,
      channelId: interaction.channelId,
      entries: [],
    };
    const { resource } = await interaction.reply({ embeds: [render(g)], components: [button()], withResponse: true });
    giveaways[resource.message.id] = g;
    save();
    scheduleGiveaway(client, resource.message.id);
  },
  async components(interaction) {
    const g = giveaways[interaction.message.id];
    if (!g) return interaction.reply({ content: 'Este sorteo ya terminó.', flags: MessageFlags.Ephemeral });
    const i = g.entries.indexOf(interaction.user.id);
    if (i === -1) g.entries.push(interaction.user.id);
    else g.entries.splice(i, 1);
    save();
    await interaction.update({ embeds: [render(g)] });
    await interaction.followUp({ content: i === -1 ? '✅ ¡Estás participando!' : '👋 Saliste del sorteo.', flags: MessageFlags.Ephemeral });
  },
};
