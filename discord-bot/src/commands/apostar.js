import { InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getUser, save } from '../db.js';
import { coin } from '../utils.js';

export default {
  category: '💰 Economía',
  data: new SlashCommandBuilder()
    .setName('apostar')
    .setDescription('Apostá monedas: 50% de duplicar, 50% de perder')
    .setContexts(InteractionContextType.Guild)
    .addIntegerOption((o) => o.setName('cantidad').setDescription('Cuánto apostás').setMinValue(10).setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('cantidad');
    const user = getUser(interaction.guild.id, interaction.user.id);
    if (user.coins < amount) {
      return interaction.reply({ content: `❌ No te alcanza. Tenés **${user.coins}** ${coin}.`, flags: MessageFlags.Ephemeral });
    }
    const win = Math.random() < 0.5;
    user.coins += win ? amount : -amount;
    save();
    await interaction.reply(
      win
        ? `🎰 ¡Ganaste! +**${amount}** ${coin} → ahora tenés **${user.coins}** ${coin}`
        : `💀 Perdiste **${amount}** ${coin} → te quedan **${user.coins}** ${coin}`,
    );
  },
};
