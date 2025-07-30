const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Display your UPS Virtual stats"),

    async execute(interaction) {
        const userId = interaction.user.id;
        const user = interaction.user;

        // Load user data
        const dataFile = path.join(__dirname, "..", "userdata.json");
        let userData = {};
        try {
            if (fs.existsSync(dataFile)) {
                userData = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }

        const userPoints = userData[userId]?.upoints || 0;
        const activeJobs = userData[userId]?.activeJobs || [];

        // Format active jobs
        let activeJobsText = "None";
        if (activeJobs.length > 0) {
            activeJobsText = activeJobs
                .map(
                    (job) =>
                        `${job.departure} <:upsarrows:1394098522835521577> ${job.arrival} (ID: ${job.jobId})`,
                )
                .join("\n");
        }

        // Create embed
        const statsEmbed = new EmbedBuilder()
            .setColor("#ffb500")
            .setTitle(`${user.username}'s UPS Stats`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                {
                    name: "<:upsstats:1394098551553921166> Airline Stats",
                    value: `Total uPoints: ${userPoints}`,
                },
                {
                    name: "<:upslist:1394225101096091699> Active Jobs",
                    value: activeJobsText,
                },
            )
            .setFooter({
                text: `UPS Virtual | ${new Date().toLocaleDateString()}`,
            });

        await interaction.reply({ embeds: [statsEmbed] });
    },
};
