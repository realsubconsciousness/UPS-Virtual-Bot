
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

// Handle slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Command error!', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  registerCommands();
});

client.login(process.env.BOT_TOKEN)
