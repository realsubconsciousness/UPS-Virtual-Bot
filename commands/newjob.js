const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("newjob")
    .setDescription("Sends a new job for pilots to claim!")
    .addStringOption((option) =>
      option.setName("name").setDescription("Job name").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("onboard")
        .setDescription("What is onboard")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("departure")
        .setDescription("Departure airport (e.g. Gran Canaria (GCLP)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("arrival")
        .setDescription("Arrival airport (e.g. Larnaca (LCLK)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("aircraft")
        .setDescription("Aircraft's ICAO (B757)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reward").setDescription("Job's reward").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description of the job")
        .setRequired(true),
    ),

  async execute(interaction) {
    // Check if user has administrator permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        content: "❌ You need Administrator permission to use this command!",
        ephemeral: true,
      });
    }

    const name = interaction.options.getString("name");
    const onboard = interaction.options.getString("onboard");
    const departure = interaction.options.getString("departure");
    const arrival = interaction.options.getString("arrival");
    const aircraft = interaction.options.getString("aircraft");
    const reward = interaction.options.getString("reward");
    const description = interaction.options.getString("description");

    // Generate random 10-digit job ID
    const jobId = Math.floor(Math.random() * 9000000000) + 1000000000;

    const embed = new EmbedBuilder()
      .setTitle("✈️ A new job has popped up!")
      .setColor("#FFB500")
      .setDescription(`**📄 Name:** ${name}\n**📦 Onboard:** ${onboard}\n**🛫 Route:** ${departure} ✈️ ${arrival}\n**✈️ Aircraft:** ${aircraft}\n**💰 Reward:** ${reward}\n**📋 Job description:**\n ${description}\n`)
      .addFields(
        { name: "📊 Status:", value: "Unclaimed", inline: true },
        { name: "👤 Claimed by:", value: "None", inline: true },
        { name: "🆔 Job ID:", value: jobId.toString(), inline: true },
      )
      .setFooter({ text: "React to claim!" });

    const claimButton = new ButtonBuilder()
      .setCustomId(`claim_job_${jobId}`)
      .setLabel("Claim Job")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✋");

    const row = new ActionRowBuilder().addComponents(claimButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};