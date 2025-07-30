
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("viewcard")
    .setDescription("View aircraft cards")
    .addStringOption((option) =>
      option
        .setName("aircraft")
        .setDescription("Select an aircraft")
        .setRequired(true)
        .addChoices(
          { name: "Boeing 757", value: "b757" },
          { name: "McDonnell Douglas MD-11", value: "md11" }
        )
    ),

  async execute(interaction) {
    const aircraft = interaction.options.getString("aircraft");
    
    // Set title based on aircraft selection
    let title;
    if (aircraft === "b757") {
      title = "Boeing 757";
    } else if (aircraft === "md11") {
      title = "McDonell Douglas MD-11";
    }

    // Create embed with front image initially
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor("#FFB500")
      .setImage(`attachment://front.png`);

    // Create front and back buttons
    const frontButton = new ButtonBuilder()
      .setCustomId(`viewcard_front_${aircraft}`)
      .setLabel("Front")
      .setStyle(ButtonStyle.Secondary);

    const backButton = new ButtonBuilder()
      .setCustomId(`viewcard_back_${aircraft}`)
      .setLabel("Back")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(frontButton, backButton);

    // Send the embed with the front image attachment
    await interaction.reply({
      embeds: [embed],
      components: [row],
      files: [{
        attachment: `media/cards/${aircraft}/front.png`,
        name: 'front.png'
      }]
    });
  },
};
