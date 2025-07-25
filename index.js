require('dotenv').config();

console.log("Working");

const fs = require("fs");
const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
})

client.commands = new Discord.Collection();

async function registerCommands() {
  const commands = [];
  
  // Check if commands directory exists
  if (!fs.existsSync("./commands")) {
    fs.mkdirSync("./commands");
    console.log("Created commands directory");
  }
  
  const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
  
  // Load each command file
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`Loaded: ${command.data.name}`);
    }
  }
  
  // Register commands with Discord (this automatically removes deleted ones)
  const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
  
  try {
    console.log('Refreshing slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands },
    );
    console.log('Successfully registered commands!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Handle slash commands and button interactions
client.on('interactionCreate', async interaction => {
  // Handle slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Command error!', ephemeral: true });
    }
  }
  
  // Handle button interactions
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('claim_job_')) {
      const jobId = interaction.customId.split('_')[2];
      
      // Get the original embed
      const originalEmbed = interaction.message.embeds[0];
      const fields = originalEmbed.fields;
      
      // Check if job is already claimed
      const statusField = fields.find(field => field.name === '📊 Status:');
      if (statusField && statusField.value === 'Claimed') {
        return await interaction.reply({ 
          content: 'This job has already been claimed!', 
          ephemeral: true 
        });
      }
      
      // Update the embed fields
      const updatedFields = fields.map(field => {
        if (field.name === '📊 Status:') {
          return { ...field, value: 'Claimed' };
        }
        if (field.name === '👤 Claimed by:') {
          return { ...field, value: `<@${interaction.user.id}>` };
        }
        return field;
      });
      
      // Create updated embed
      const updatedEmbed = Discord.EmbedBuilder.from(originalEmbed)
        .setFields(updatedFields)
        .setColor('#00FF00'); // Change color to green when claimed
      
      // Disable the button
      const disabledButton = Discord.ButtonBuilder.from(interaction.message.components[0].components[0])
        .setDisabled(true)
        .setLabel('Job Claimed')
        .setStyle(Discord.ButtonStyle.Secondary);
      
      const disabledRow = new Discord.ActionRowBuilder().addComponents(disabledButton);
      
      await interaction.update({ 
        embeds: [updatedEmbed], 
        components: [disabledRow] 
      });
    }
    
    // Handle upoints button interactions
    if (interaction.customId.startsWith('upoints_')) {
      const fs = require("fs");
      const path = require("path");
      
      const dataFile = path.join(__dirname, "userdata.json");
      
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
      
      function saveUserData(data) {
        try {
          fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      }
      
      function getUserPoints(userId) {
        const userData = loadUserData();
        return userData[userId]?.upoints || 0;
      }
      
      function setUserPoints(userId, points) {
        const userData = loadUserData();
        if (!userData[userId]) {
          userData[userId] = {};
        }
        userData[userId].upoints = points;
        saveUserData(userData);
      }
      
      const parts = interaction.customId.split('_');
      const action = parts[1]; // 'add' or 'remove'
      const userId = parts[2];
      const number = parseInt(parts[3]);
      
      const currentPoints = getUserPoints(userId);
      let newPoints;
      
      if (action === 'add') {
        newPoints = currentPoints + number;
      } else if (action === 'remove') {
        newPoints = Math.max(0, currentPoints - number); // Don't allow negative points
      }
      
      // Confirmation embed
      const confirmEmbed = new Discord.EmbedBuilder()
        .setTitle("Confirm uPoints Change")
        .setColor("#FFB500")
        .setDescription(
          `Are you sure you want to ${action} ${number} uPoints ${action === 'add' ? 'to' : 'from'} <@${userId}>?\n\n` +
          `Current uPoints: ${currentPoints}\n` +
          `New uPoints: ${newPoints}`
        );
      
      const confirmButton = new Discord.ButtonBuilder()
        .setCustomId(`upoints_confirm_${action}_${userId}_${number}`)
        .setLabel("Confirm")
        .setStyle(Discord.ButtonStyle.Success)
        .setEmoji("✅");
      
      const cancelButton = new Discord.ButtonBuilder()
        .setCustomId("upoints_cancel")
        .setLabel("Cancel")
        .setStyle(Discord.ButtonStyle.Secondary)
        .setEmoji("❌");
      
      const confirmRow = new Discord.ActionRowBuilder().addComponents(confirmButton, cancelButton);
      
      await interaction.update({
        embeds: [confirmEmbed],
        components: [confirmRow]
      });
    }
    
    // Handle upoints confirmation
    if (interaction.customId.startsWith('upoints_confirm_')) {
      const fs = require("fs");
      const path = require("path");
      
      const dataFile = path.join(__dirname, "userdata.json");
      
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
      
      function saveUserData(data) {
        try {
          fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      }
      
      function getUserPoints(userId) {
        const userData = loadUserData();
        return userData[userId]?.upoints || 0;
      }
      
      function setUserPoints(userId, points) {
        const userData = loadUserData();
        if (!userData[userId]) {
          userData[userId] = {};
        }
        userData[userId].upoints = points;
        saveUserData(userData);
      }
      
      const parts = interaction.customId.split('_');
      const action = parts[2]; // 'add' or 'remove'
      const userId = parts[3];
      const number = parseInt(parts[4]);
      
      const currentPoints = getUserPoints(userId);
      let newPoints;
      
      if (action === 'add') {
        newPoints = currentPoints + number;
      } else if (action === 'remove') {
        newPoints = Math.max(0, currentPoints - number);
      }
      
      setUserPoints(userId, newPoints);
      
      // Success embed
      const successEmbed = new Discord.EmbedBuilder()
        .setTitle("✅ uPoints Updated Successfully!")
        .setColor("#00FF00")
        .setDescription(
          `Successfully ${action === 'add' ? 'added' : 'removed'} ${number} uPoints ${action === 'add' ? 'to' : 'from'} <@${userId}>\n\n` +
          `Previous uPoints: ${currentPoints}\n` +
          `New uPoints: ${newPoints}`
        );
      
      try {
        await interaction.update({
          embeds: [successEmbed],
          components: []
        });
      } catch (error) {
        if (error.code === 'InteractionAlreadyReplied') {
          await interaction.followUp({
            embeds: [successEmbed],
            ephemeral: true
          });
        } else {
          console.error('Error updating interaction:', error);
        }
      }
    }
    
    // Handle upoints cancel
    if (interaction.customId === 'upoints_cancel') {
      const cancelEmbed = new Discord.EmbedBuilder()
        .setTitle("❌ Operation Cancelled")
        .setColor("#FF0000")
        .setDescription("uPoints modification has been cancelled.");
      
      try {
        await interaction.update({
          embeds: [cancelEmbed],
          components: []
        });
      } catch (error) {
        if (error.code === 'InteractionAlreadyReplied') {
          await interaction.followUp({
            embeds: [cancelEmbed],
            ephemeral: true
          });
        } else {
          console.error('Error updating interaction:', error);
        }
      }
    }
    
    // Handle mark as done button interactions
    if (interaction.customId.startsWith('mark_done_')) {
      // Check if user has administrator permission
      if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        return await interaction.reply({
          content: "❌ You need Administrator permission to mark jobs as done!",
          ephemeral: true
        });
      }
      
      const jobId = interaction.customId.split('_')[2];
      
      // Get the original embed
      const originalEmbed = interaction.message.embeds[0];
      const fields = originalEmbed.fields;
      
      // Check if job is already done
      const statusField = fields.find(field => field.name === '📊 Status:');
      if (statusField && statusField.value === 'Done') {
        return await interaction.reply({ 
          content: 'This job is already marked as done!', 
          ephemeral: true 
        });
      }
      
      // Update the embed fields
      const updatedFields = fields.map(field => {
        if (field.name === '📊 Status:') {
          return { ...field, value: 'Done' };
        }
        return field;
      });
      
      // Create updated embed
      const updatedEmbed = Discord.EmbedBuilder.from(originalEmbed)
        .setFields(updatedFields)
        .setColor('#32CD32'); // Change color to lime green when done
      
      // Disable all buttons
      const disabledClaimButton = Discord.ButtonBuilder.from(interaction.message.components[0].components[0])
        .setDisabled(true);
      
      const disabledDoneButton = Discord.ButtonBuilder.from(interaction.message.components[0].components[1])
        .setDisabled(true)
        .setLabel('Job Complete')
        .setStyle(Discord.ButtonStyle.Secondary);
      
      const disabledRow = new Discord.ActionRowBuilder().addComponents(disabledClaimButton, disabledDoneButton);
      
      await interaction.update({ 
        embeds: [updatedEmbed], 
        components: [disabledRow] 
      });
    }
  } 
});

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(process.env.BOT_TOKEN)
