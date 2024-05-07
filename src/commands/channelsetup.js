const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType, ButtonBuilder, ButtonStyle, MessageActionRow, MessageButton,
    ActionRowBuilder
} = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/setup.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('channelsetup')
    .setDescription('Setsup the account channel')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Which channel we are setting')
            .setRequired(true)
            .addChoices(
                {name: 'Rates', value: 'rates'},
                {name: 'Account', value: 'account'}
            )
    )
    .addChannelOption((option) => 
        option
            .setName('channel')
            .setDescription('The channel your accounts will be tracked in')
            .setRequired(true)
    )

async function run({interaction, client}) {

    const guildId = interaction.guild.id;
    const channel = interaction.options.getChannel('channel');
    if(interaction.options.getString('type') === 'account') {
        accChannel(guildId, channel);

        interaction.reply({
            content: `Success! Channel #${channel.name}, will be used to monitor your accounts`,
            ephemeral: true
        });
    } else {
        ratesChannel(guildId,channel);
        
        interaction.reply({
            content: `Success! Channel #${channel.name}, will be used to monitor Smalls Rates`,
            ephemeral: true
        });
    }
}

async function accChannel(guildId, channel) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.accountChannel = channel.id

    const info = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Account Tracking')
        .setTimestamp();

    const accNotifyButton = new ButtonBuilder()
        .setEmoji('🤝')
        .setLabel('Free Account Notify')
        .setStyle('Primary')
        .setCustomId(`${channel.id}.accountNotify`);

    const actionRow = new ActionRowBuilder().addComponents(accNotifyButton);

    const message = await channel.send({ embeds: [info], components: [actionRow] });
    
    mainIdMap.accountMessageID = message.id;

    saveGuildMainIdMapsToFile();
}

async function ratesChannel(guildId, channel) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.ratesChannel = channel.id

    const info = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Rates Tracking')
        .setTimestamp();

    const ratesNotifyButton = new ButtonBuilder()
        .setEmoji('🤝')
        .setLabel('Notify Rates Change')
        .setStyle('Primary')
        .setCustomId(`${channel.id}.ratesNotify`);

    const actionRow = new ActionRowBuilder().addComponents(ratesNotifyButton);

    const message = await channel.send({embeds: [info], components: [actionRow]});
    mainIdMap.ratesMessageID = message.id;

    saveGuildMainIdMapsToFile();
}

function readGuildMainIdMapFromFile() {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        guildMainIdMaps = JSON.parse(data);
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
    return guildMainIdMaps[guildId];
}



const options = {
    devOnly: false,
};

module.exports = { data, run, options };