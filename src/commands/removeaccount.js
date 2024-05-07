const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/trackedPlayers.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('removeaccount')
    .setDescription('Removes a steam account from being tracked')
    .addStringOption((option) => 
        option
            .setName('name')
            .setDescription('Name of the account')
            .setRequired(true)
    );

function run({ interaction, client }) {

    const guildId = interaction.guild.id;

    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    const name = interaction.options.getString('name');

    mainIdMap.delete(name);

    guildMainIdMaps[guildId] = Object.fromEntries(mainIdMap);

    saveGuildMainIdMapsToFile();

    interaction.reply({content: `Success! ${name}, will no longer be tracked` , ephemeral: true});
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