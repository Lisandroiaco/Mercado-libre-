import { Events, MessageFlags } from 'discord.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    let command;
    let run;

    if (interaction.isChatInputCommand()) {
      command = client.commands.get(interaction.commandName);
      run = () => command.execute(interaction, client);
    } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
      // Los botones/menús usan customId "comando:arg1:arg2"
      const [name, ...args] = interaction.customId.split(':');
      command = client.commands.get(name);
      if (!command?.components) return;
      run = () => command.components(interaction, args, client);
    } else {
      return;
    }
    if (!command) return;

    try {
      await run();
    } catch (error) {
      console.error(`Error en ${command.data.name}:`, error);
      const reply = { content: '❌ Hubo un error al ejecutar esto.', flags: MessageFlags.Ephemeral };
      if (interaction.replied || interaction.deferred) await interaction.followUp(reply).catch(() => {});
      else await interaction.reply(reply).catch(() => {});
    }
  },
};
