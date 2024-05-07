const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/trackedPlayers.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('addaccount')
    .setDescription('Adds a Steam Account to be tracked.')
    .addStringOption((option) => 
        option
            .setName('name')
            .setDescription('Name of the account')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('id')
            .setDescription('Steam 64 ID for the account')
            .setRequired(true)
    )
    .addIntegerOption((option) =>
        option
            .setName('server')
            .setDescription('Server Number the Account is on')
            .setRequired(true))

function run({ interaction, client }) {

    const guildId = interaction.guild.id;

    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    const name = interaction.options.getString('name');
    const id = interaction.options.getString('id')
    const server = interaction.options.getInteger('server')

    if(mainIdMap.has(name)) {
        const entry = mainIdMap.get(name);
        
        entry.id = id;
        entry.server = server;
    } else {
        const newEntry = {
            id,
            server
        }
        
        mainIdMap.set(name, newEntry);
    }
    
    guildMainIdMaps[guildId] = Object.fromEntries(mainIdMap);
    
    saveGuildMainIdMapsToFile();

    interaction.reply({content: `Success! ${name}, will now by tracked momentarily with steam ID: ` + '`' + id + '`' , ephemeral: true});
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