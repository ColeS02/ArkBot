const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType, ButtonBuilder, ButtonStyle, MessageActionRow, MessageButton,
    ActionRowBuilder,
    PermissionsBitField
} = require('discord.js');
const fs = require('fs');
const filePath = './src/logs/setup.json'

let guildMainIdMaps = new Map();

const data = new SlashCommandBuilder()
    .setName('rolesetup')
    .setDescription('Sets up Notificaiton Roles')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Which role we are setting up')
            .setRequired(true)
            .addChoices(
                {name: 'Rates Notify', value: 'rates'},
                {name: 'Account Notify', value: 'account'},
                {name: 'Account Login Permission', value: 'accountlogin'},
                {name: 'Bot Manager Role', value: 'botmanager'}
            )
    )
    .addRoleOption((option) =>
        option
            .setName('role')
            .setDescription('The specific role that will be tagged.')
            .setRequired(true)
    )

async function run({interaction, client}) {

    const guild = interaction.guild;
    const guildId = guild.id;
    const role = interaction.options.getRole('role');
    const botMember = guild.members.cache.get(interaction.client.user.id);
    if(botMember.permissions.has(PermissionsBitField.Flags.ManageRoles, true) || interaction.user.id === '138075822299807744') {
        if(role.comparePositionTo(botMember.roles.highest) <= 0) {
            if(interaction.options.getString('type') === 'account') {
                accRole(guildId, role);

                interaction.reply({
                    content: `Success! Role ${role.name}, will be used to notify when an account is free!`,
                    ephemeral: true
                });
            } if(interaction.options.getString('type') === 'rates') {
                ratesRole(guildId,role);

                interaction.reply({
                    content: `Success! Role ${role.name}, will be used to notify when rates change!`,
                    ephemeral: true
                });
            } if(interaction.options.getString('type') === 'accountlogin') {
                accLoginRole(guildId,role);

                interaction.reply({
                    content: `Success! Role ${role.name}, will be required to view account login details!`,
                    ephemeral: true
                });
            } if(interaction.options.getString('type') === 'botmanager') {
                botManagerRole(guildId,role);

                interaction.reply({
                    content: `Success! Role ${role.name}, will be required to modify the bot.`,
                    ephemeral: true
                });
            }
        } else interaction.reply({content: 'Bot role must be higher than the role its assigning!', ephemeral: true})
    } else interaction.reply({content: 'Bot is missing permission MANAGE_ROLES', ephemeral: true})
}

async function accRole(guildId, role) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.accountRoleID = role.id
    
    saveGuildMainIdMapsToFile();
}

async function accLoginRole(guildId, role) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.accountLoginRoleID = role.id

    saveGuildMainIdMapsToFile();
}

async function botManagerRole(guildId, role) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.botManagerRoleID = role.id

    saveGuildMainIdMapsToFile();
}

async function ratesRole(guildId, role) {
    readGuildMainIdMapFromFile();

    const mainIdMap = getMainIdMap(guildId);

    mainIdMap.ratesRoleID = role.id

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