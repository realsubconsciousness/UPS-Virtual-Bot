const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display your UPS Virtual stats'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = interaction.user;
        
        // Load user data
        const dataFile = path.join(__dirname, '..', 'userdata.json');
        const userData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        const userPoints = userData[userId]?.upoints || 0;

        // Create embed
        const statsEmbed = new EmbedBuilder()
            .setColor('#ffb500')
            .setTitle(`${user.username}'s UPS Stats`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Airline Stats', value: `Total uPoints: ${userPoints}` }
            )
            .setFooter({ text: `UPS Virtual | ${new Date().toLocaleDateString()}` });

        await interaction.reply({ embeds: [statsEmbed] });
    },
};