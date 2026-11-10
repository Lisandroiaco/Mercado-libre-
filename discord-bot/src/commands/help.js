// /help con menú desplegable por categoría (se arma solo con los comandos que existan)
import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { embed } from '../utils.js';

function categories(client) {
  const map = new Map();
  for (const cmd of client.commands.values()) {
    const cat = cmd.category ?? 'Otros';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(cmd);
  }
  return map;
}

function menu(client) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('help:cat')
      .setPlaceholder('Elegí una categoría')
      .addOptions([...categories(client).keys()].map((c) => ({ label: c, value: c }))),
  );
}

export default {
  category: '🛠️ Utilidad',
  data: new SlashCommandBuilder().setName('help').setDescription('Lista todos los comandos del bot'),
  async execute(interaction, client) {
    const e = embed()
      .setTitle(`📖 ${client.user.username} — comandos`)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        [...categories(client)].map(([c, cmds]) => `**${c}** · ${cmds.length} comandos`).join('\n') +
          '\n\nElegí una categoría abajo para ver el detalle 👇',
      )
      .setFooter({ text: `${client.commands.size} comandos en total` });
    await interaction.reply({ embeds: [e], components: [menu(client)] });
  },
  async components(interaction, args, client) {
    const cat = interaction.values[0];
    const cmds = categories(client).get(cat) ?? [];
    const e = embed()
      .setTitle(cat)
      .setDescription(cmds.map((c) => `\`/${c.data.name}\` — ${c.data.description}`).join('\n'));
    await interaction.update({ embeds: [e], components: [menu(client)] });
  },
};
