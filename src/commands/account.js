const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/accDetails.json'
const accPath = './src/logs/setup.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('account')
    .setDescription('Gets the login details for an account')
    .addStringOption((option) =>
        option
            .setName('name')
            .setDescription('Name of the account')
            .setRequired(true)
            .setAutocomplete(true)
    )

function run({ interaction, client }) {
    const data = JSON.parse(fs.readFileSync(accPath, 'utf-8'));
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const hasRole = member.roles.cache.has(data[interaction.guild.id].accountLoginRoleID);

    if(!hasRole) {
        interaction.reply({content: 'Insufficient permissions!', ephemeral: true});
        return;
    }

    const guildId = interaction.guild.id;

    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    const name = interaction.options.getString('name');

    console.log('Main Id Map:', mainIdMap);

    if (!mainIdMap.get(name)) {
        console.error(`No entry found for ${name} in mainIdMap.`);
        interaction.reply({ content: 'Account details not found.', ephemeral: true });
        return;
    }

    const info = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Login Information')
        .addFields(
            {name: 'Username:', value: '`' + mainIdMap.get(name).username + '`', inline: true},
            {name: 'Password:', value: '`' + mainIdMap.get(name).password + '`', inline: true}
        )
        .setTimestamp();


    interaction.reply({embeds: [info] , ephemeral: true});
}

function readGuildMainIdMapFromFile() {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        guildMainIdMaps = JSON.parse(data) || {};
    } catch (error) {
        console.log('Error reading guildMainIdMaps from file: ', error.message);
    }
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
function getMainIdMap(guildId) {
    if (!guildMainIdMaps[guildId]) {
        guildMainIdMaps[guildId] = {};
        saveGuildMainIdMapsToFile();
    }
    return new Map(Object.entries(guildMainIdMaps[guildId]));
}



const options = {
    devOnly: false,
};

module.exports = { data, run, options };