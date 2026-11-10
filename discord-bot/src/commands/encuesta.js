// Encuestas con botones; un voto por persona (se puede cambiar). Se guardan en la base de datos.
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { polls, save } from '../db.js';
import { embed } from '../utils.js';

const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

function render(poll) {
  const total = Object.keys(poll.votes).length;
  const counts = poll.options.map((_, i) => Object.values(poll.votes).filter((v) => v === i).length);
  const lines = poll.options.map((opt, i) => {
    const pct = total ? Math.round((counts[i] / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(pct / 10)).padEnd(10, '░');
    return `${numbers[i]} **${opt}**\n\`${bar}\` ${pct}% (${counts[i]})`;
  });
  return embed().setTitle(`📊 ${poll.question}`).setDescription(lines.join('\n\n')).setFooter({ text: `${total} votos` });
}

const option = (n) => (o) => o.setName(`opcion${n}`).setDescription(`Opción ${n}`).setRequired(n <= 2);

export default {
  category: '🎉 Comunidad',
  data: new SlashCommandBuilder()
    .setName('encuesta')
    .setDescription('Crea una encuesta con botones')
    .addStringOption((o) => o.setName('pregunta').setDescription('La pregunta').setRequired(true))
    .addStringOption(option(1)).addStringOption(option(2)).addStringOption(option(3))
    .addStringOption(option(4)).addStringOption(option(5)),
  async execute(interaction) {
    const options = [1, 2, 3, 4, 5].map((n) => interaction.options.getString(`opcion${n}`)).filter(Boolean);
    const poll = { question: interaction.options.getString('pregunta'), options, votes: {} };
    const row = new ActionRowBuilder().addComponents(
      options.map((opt, i) =>
        new ButtonBuilder().setCustomId(`encuesta:${i}`).setEmoji(numbers[i]).setLabel(opt.slice(0, 80)).setStyle(ButtonStyle.Secondary),
      ),
    );
    const { resource } = await interaction.reply({ embeds: [render(poll)], components: [row], withResponse: true });
    polls[resource.message.id] = poll;
    save();
  },
  async components(interaction, [index]) {
    const poll = polls[interaction.message.id];
    if (!poll) return interaction.reply({ content: 'Esta encuesta ya no está activa.', flags: MessageFlags.Ephemeral });
    poll.votes[interaction.user.id] = Number(index);
    save();
    await interaction.update({ embeds: [render(poll)] });
  },
};
