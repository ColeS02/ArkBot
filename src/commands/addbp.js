const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require('path');

const DIRECTORY = './src/logs/bps';

const data = new SlashCommandBuilder()
    .setName('addbp')
    .setDescription('Adds a bp to the database')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('The BP Type')
            .setRequired(true)
            .setAutocomplete(true)
    ).addStringOption((option) =>
        option
            .setName('bp-link')
            .setDescription('The BP Link(s) that the bot will post')
    );

function run({ interaction, client }) {
    createJSonFile(DIRECTORY, interaction.guild.id + '.json');
    
    const filePath = path.join(DIRECTORY, interaction.guild.id + '.json');
    
    console.log(filePath)
    
    const bpDataFile = fs.readFileSync(filePath, 'utf-8');
    let bpsJSON;

    try {
        bpsJSON = JSON.parse(bpDataFile);
    } catch (error) {
        console.error('Error parsing JSON from bps.json:', error);
        // Handle the error accordingly, e.g., return or throw an error
    }

    const type = interaction.options.getString('type');
    const links = interaction.options.getString('bp-link');

    // Check if bpsJSON is an array, and initialize it as an object if necessary
    if (!Array.isArray(bpsJSON[type])) {
        bpsJSON[type] = [];
    }

    const newLinkId = bpsJSON[type].length + 1;

    bpsJSON[type].push({ id: newLinkId, link: links.trim() });

    const dataWrite = JSON.stringify(bpsJSON, null, 2);

    fs.writeFile(filePath, dataWrite, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log('BPS.JSON Written correctly');
        }
    });

    interaction.reply({ content: 'Success', ephemeral: true });
}

function createJSonFile(directory, filename) {
    const filePath = path.join(directory, filename);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
}

const options = {
    devOnly: false,
};

module.exports = { data, run, options };