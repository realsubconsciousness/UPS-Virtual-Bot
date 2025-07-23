
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
      const statusField = fields.find(field => field.name.includes('📊 Status:'));
      if (statusField && statusField.name.includes('Claimed')) {
        return await interaction.reply({ 
          content: 'This job has already been claimed!', 
          ephemeral: true 
        });
      }
      
      // Update the embed fields
      const updatedFields = fields.map(field => {
        if (field.name === '📊 Status: Unclaimed') {
          return { ...field, name: '📊 Status: Claimed' };
        }
        if (field.name === '👤 Claimed by: None') {
          return { ...field, name: `👤 Claimed by: <@${interaction.user.id}>` };
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
  }
});

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(process.env.BOT_TOKEN)
