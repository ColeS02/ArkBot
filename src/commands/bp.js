const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require("fs");
const path = require('path');

const DIRECTORY = './src/logs/bps';

const data = new SlashCommandBuilder()
    .setName('bp')
    .setDescription('View a current tribe BP!')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('The BP Type')
            .setRequired(true)
            .setAutocomplete(true)
    );

function run({ interaction, client }) {
    
    createJSonFile(DIRECTORY, interaction.guild.id + '.json');
    
    const filePath = path.join(DIRECTORY, interaction.guild.id + '.json');
    
    try {
        const dataFile = fs.readFileSync(filePath, 'utf-8');
        const bps = JSON.parse(dataFile)
        const type = interaction.options.getString('type');

        if (bps[type] != null) {
            const linksArray = bps[type];

            if (linksArray.length > 0) {
                const linksDescription = linksArray.map(linkObj => 'ID: `' + `${linkObj.id}` + '`:' +  `${linkObj.link}`).join('\n');
                interaction.reply(linksDescription);
            } else {
                interaction.reply({ content: 'No links found for this BP type.', ephemeral: true });
            }
        } else {
            interaction.reply({ content: 'BP Currently not set! (/addbp)', ephemeral: true });
        }
        
    } catch (error) {
        interaction.reply({ content: 'BP Currently not set! (/addbp)', ephemeral: true });
    }
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