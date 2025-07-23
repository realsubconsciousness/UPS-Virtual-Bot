
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// File to store user points data
const dataFile = path.join(__dirname, "..", "userdata.json");

// Load user data from file
function loadUserData() {
  try {
    if (fs.existsSync(dataFile)) {
      const data = fs.readFileSync(dataFile, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading user data:", error);
  }
  return {};
}

// Save user data to file
function saveUserData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
}

// Get user points
function getUserPoints(userId) {
  const userData = loadUserData();
  return userData[userId]?.upoints || 0;
}

// Set user points
function setUserPoints(userId, points) {
  const userData = loadUserData();
  if (!userData[userId]) {
    userData[userId] = {};
  }
  userData[userId].upoints = points;
  saveUserData(userData);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("upoints")
    .setDescription("Manage user points (Admin only)")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to modify points for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("Number of points to add or remove")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if user has administrator permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        content: "❌ You need Administrator permission to use this command!",
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("user");
    const number = interaction.options.getInteger("number");
    const currentPoints = getUserPoints(targetUser.id);

    const embed = new EmbedBuilder()
      .setTitle("uPoint menu")
      .setColor("#FFB500")
      .setDescription(
        `User: <@${targetUser.id}>\nUser ID: ${targetUser.id}\nCurrent uPoints: ${currentPoints}`
      );

    const addButton = new ButtonBuilder()
      .setCustomId(`upoints_add_${targetUser.id}_${number}`)
      .setLabel("Add")
      .setStyle(ButtonStyle.Success)
      .setEmoji("➕");

    const removeButton = new ButtonBuilder()
      .setCustomId(`upoints_remove_${targetUser.id}_${number}`)
      .setLabel("Remove")
      .setStyle(ButtonStyle.Danger)
      .setEmoji("➖");

    const row = new ActionRowBuilder().addComponents(addButton, removeButton);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
