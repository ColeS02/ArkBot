const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/accDetails.json'
const accPath = './src/logs/setup.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('manager')
    .setDescription('Get a manager GUI to easily manage everything.')

async function run({interaction, client}) {
    const data = JSON.parse(fs.readFileSync(accPath, 'utf-8'));
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const hasRole = member.roles.cache.has(data[interaction.guild.id].botManagerRoleID);

    if (!hasRole) {
        interaction.reply({content: 'Insufficient permissions!', ephemeral: true});
        return;
    }

    const info = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('ASA Smalls Manager')
        .setTimestamp();

    const accountManagementButton = new ButtonBuilder()
        .setEmoji('👨‍🔧')
        .setLabel('Account Management')
        .setStyle('Primary')
        .setCustomId(`accountManagement`);

    const actionRow = new ActionRowBuilder().addComponents(accountManagementButton);

    interaction.reply({embeds: [info], components: [actionRow], ephemeral: true});
}

function saveGuildMainIdMapsToFile() {
    try {
        const data = JSON.stringify(guildMainIdMaps, null, 2);
        console.log('Saving data to file:', data);
        fs.writeFileSync(filePath, data, 'utf8');
    } catch (error) {
        console.error('Error saving guildMainIdMaps to file:', error.message);
    }
}

const options = {
    devOnly: false,
};

module.exports = { data, run, options };