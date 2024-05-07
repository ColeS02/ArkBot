const { guildArray } = require('../ready/log');
const fs = require("fs");
const {EmbedBuilder, ButtonBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require("discord.js");
const filePath = './src/logs/setup.json'
const trackedPlayers = './src/logs/trackedPlayers.json'

let guildMainIdMaps = new Map();

module.exports = async (interaction) => {

    if (interaction.isButton()) {
        if (interaction.customId.toString() === 'accountManagement') {
            const GUILD = interaction.guild;
            const user = interaction.member;
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            const hasRole = user.roles.cache.has(data[GUILD.id].botManagerRoleID);

            if (!hasRole) {
                interaction.reply({content: 'Insufficient permissions!', ephemeral: true});
                return;
            }

            const info = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('ASA Smalls Manager')
                .setTimestamp();

            const accountAccess = new ButtonBuilder()
                .setEmoji('👨‍🔧')
                .setLabel('Account Access')
                .setStyle('Primary')
                .setCustomId(`accountAccess`);

            const actionRow = new ActionRowBuilder().addComponents(accountAccess);

            interaction.reply({embeds: [info], components: [actionRow], ephemeral: true});

        }
        if (interaction.customId.toString() === 'accountAccess') {
            const GUILD = interaction.guild;
            const user = interaction.member;
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            const hasRole = user.roles.cache.has(data[GUILD.id].botManagerRoleID);

            if (!hasRole) {
                interaction.reply({content: 'Insufficient permissions!', ephemeral: true});
                return;
            }

            readGuildMainIdMapFromFile();

            const mainIdMap = getMainIdMap(GUILD.id);

            const accounts = Array.from(mainIdMap).map(([name, {id, server}]) => ({
                label: name,
                value: name,
            }));

            /*await GUILD.members.fetch();
            
            const allMembers = GUILD.members.cache.map((member) => ({
                label: member.user.tag,
                value: member.id,
            }));*/

            const PAGE_SIZE = 25;
            const PAGE_COUNT = Math.ceil(accounts.length / PAGE_SIZE);
            let currentPage = 1;

            const updateSelectMenu = async () => {
                const startIdx = (currentPage - 1) * PAGE_SIZE;
                const endIdx = startIdx + PAGE_SIZE;
                const pageMembers = accounts.slice(startIdx, endIdx);

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('selectAccount')
                    .setPlaceholder('Select account(s) to modify!')
                    .addOptions(pageMembers);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                const messageContent = `Select which account(s) you'd like to modify (Page ${currentPage}/${PAGE_COUNT}):`

                if (currentPage > 1) {
                    const prevButton = new ButtonBuilder().setCustomId('prevPage').setLabel('Previous').setStyle('PRIMARY');
                    row.addComponents(prevButton);
                }

                if (currentPage < PAGE_COUNT) {
                    const nextButton = new ButtonBuilder().setCustomId('nextPage').setLabel('Next').setStyle('PRIMARY');
                    row.addComponents(nextButton);
                }

                await interaction.reply({content: messageContent, components: [row], ephemeral: true});
            };

            await updateSelectMenu();
        }
    }
    if(interaction.isStringSelectMenu()) {
        if(interaction.customId.toString() === 'selectAccount') {
            const selectedOptions = interaction.values;
            
            se
        }
    }
};

function readGuildMainIdMapFromFile() {
    try {
        const data = fs.readFileSync(trackedPlayers, 'utf-8');
        guildMainIdMaps = JSON.parse(data) || {};
    } catch (error) {
        console.log('Error reading guildMainIdMaps from file: ', error.message);
    }
}

function getMainIdMap(guildId) {
    if (!guildMainIdMaps[guildId]) {
        guildMainIdMaps[guildId] = {};
        saveGuildMainIdMapsToFile();
    }
    return new Map(Object.entries(guildMainIdMaps[guildId]));
}