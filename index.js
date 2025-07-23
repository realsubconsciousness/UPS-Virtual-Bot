console.log("Working");

const fs = require("fs");
const Discord = require("discord.js");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
})

client.login(process.env.BOT_TOKEN)

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))