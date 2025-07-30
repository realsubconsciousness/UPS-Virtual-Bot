const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns the bot's ping"),

  async execute(interaction) {
    const ping = Date.now() - interaction.createdTimestamp; // Get ping in ms
    const embed = new EmbedBuilder()
      .setColor("#FFB500")
      .setDescription(`Pong! ${ping} ms`)
      .setFooter({ text: `UPS Virtual Bot | ${new Date().toISOString()}` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
