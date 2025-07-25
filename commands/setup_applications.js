const { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  ButtonBuilder, 
  ButtonStyle, 
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pilot-application')
    .setDescription('Send the pilot application message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });  // <--- Aquí deferir la respuesta

    const channel = await interaction.guild.channels.fetch('1394015023847702629');

    // 1. Enviar la primera imagen sola
    await channel.send({ files: ['https://i.imgur.com/9VWjETt.png'] });

    // 2. Crear el embed con campos separados
    const embed = new EmbedBuilder()
      .setColor(0xF2C744)
      .setDescription(
        "**📩┃Application Information**\n\nAt UPS, we believe that anyone is suitable to be a pilot, as we offer extreme flexibility, and almost no requisites. Additionally, we offer several jobs so you will never doubt what to do.\n\nWe wish the best of luck to those who apply.\n\n<:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821><:upsslash:1396080766928158821>"
      )
      .addFields(
        {
          name: "🎓┃ UPS Virtual Pilot Application",
          value: "Get ready for takeoff! Interact below to become a pilot!"
        },
        {
          name: "👔┃ UPS Moderation & Management Team",
          value: "Rather working with us on the inside? Applications are currently closed, but will open soon!"
        }
      )
      .setImage('https://i.imgur.com/6gWmnQ6.png');

    // 3. Botón gris
    const button = new ButtonBuilder()
      .setCustomId('toggle_pilot_role')
      .setLabel('Becoma a Pilot!')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    // 4. Enviar el embed con el botón
    await channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.editReply({ content: 'Application message sent!' });  // <--- Editar respuesta
  }
};
