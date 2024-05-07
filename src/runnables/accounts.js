const {EmbedBuilder} = require("discord.js");
const fs = require("fs");
const { guildArray } = require('../events/ready/log');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const UPDATE_INTERVAL = 60 * 1000;
const MAX_CONSECUTIVE_ERRORS = 3;
const PAUSE_DURATION = 30 * 1000;

let consecutiveErrorCount = 0;
let lastPause = 0;
let steamInterval;
let onlineCache = new Map();


let client;
function start(newClient) {
    client = newClient;
    steamInterval = setInterval(fetchStatusAndEditMessageForAllGuilds, UPDATE_INTERVAL);
}
function createTribeEmbed(title) {
    return new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(title)
        .setTimestamp();
}

let idMapsByGuild = [];

function readGuildMainIdMapFromFile() {
    try {
        const filePath = './src/logs/trackedPlayers.json'
        const data = fs.readFileSync(filePath, 'utf-8');
        return idMapsByGuild = JSON.parse(data);
    } catch (error) {
        console.log('Error reading guildMainIdMaps from file: ', error.message);
        return null;
    }
}

async function fetchStatusAndEditMessageForAllGuilds() {
    try {
        console.log('Starting to fetch information for all guilds');
        const guildIdMaps = readGuildMainIdMapFromFile()
        if (guildIdMaps) {
            for (const [guildId, idMap] of Object.entries(guildIdMaps)) {
                try {
                    const guild = await client.guilds.fetch(guildId);
                    if (guild) {
                        const message = await fetchMessageForGuild(guild);
                        if (message) {
                            const mainTribeEmbed = createTribeEmbed('Main Tribe Accounts');
                            await fetchStatusAndEditMessage(mainTribeEmbed, message, idMap, guild);
                        } else {
                            console.error(`Unable to fetch message for guild ${guild.name} (${guildId})`);
                        }
                    }
                } catch (error) {
                    
                }
                await sleep(2000);
            }
        }
        console.log('Finished fetching information for all guilds');
    } catch (error) {
        console.error('An error occurred while fetching information for all guilds:', error);
    }
}

async function fetchMessageForGuild(guild) {
    const filePath = './src/logs/setup.json'
    let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (guild) {
        const id = guild.id.toString();
        const channel = guild.channels.cache.get(data[id].accountChannel);

        const message = await channel.messages.fetch(data[id].accountMessageID)
        console.log(`Channels for Guild ID: ${guild.id}, Guild Name: ${guild.name}`);
        return message;
    } else {
        console.error(`Guild with ID ${guildId} not found.`);
        return null;
    }
}

async function fetchStatusAndEditMessage(embedMessage, message, idMap, guild) {
    let categoryMap = {};
    let allOnline = true;

    try {
        await Promise.all(Object.entries(idMap).map(async ([key, steamIdData]) => {
            try {
                const { id, server } = steamIdData;

                if (consecutiveErrorCount >= 3) {
                    if (lastPause < Date.now() / 1000) {
                        consecutiveErrorCount = 0;
                    }
                } else {
                    const isPlaying = await isPlayingGame(id);
                    const statusText = isPlaying ? 'is Online!' : 'is Offline!';
                    
                    if (!categoryMap[server]) {
                        categoryMap[server] = [];
                    }
 
                    categoryMap[server].push(`:${isPlaying ? 'green' : 'red'}_circle: **${key}** - ${statusText}`);

                    if (!isPlaying) allOnline = false;
                }
            } catch (error) {
                categoryMap[0].push(`❓ **${key}** - Error!`);
                console.error(`Error checking status for ${key}:`, error);
            }
        }));
    } catch (error) {
        console.error(`An error occurred in the Promise.all:`, error);
    }
    
    let description = '';
    Object.entries(categoryMap).forEach(([serverNumber, accounts]) => {
        description += `**Server ${serverNumber}:**\n${accounts.join('\n')}\n\n`;
    });

    description += `\n\nUpdated: <t:${Math.floor(Date.now() / 1000)}:R>`;
    embedMessage.setDescription(description);
    message.edit({ embeds: [embedMessage] });
    
    if(!onlineCache[guild.id]) onlineCache[guild.id] = {};
    if(onlineCache[guild.id].allOnline === true && allOnline === false) {
        const filePath = './src/logs/setup.json'
        let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if(data[guild.id].accountRoleID != null) {
            message.channel.send('<@&' + data[guild.id].accountRoleID + '> an account has become free!').then(message => {
                setTimeout(() => {
                    try {
                        message.delete();
                    } catch(error) {

                    }
                }, 10 * 1000);
            })
        }
        onlineCache[guild.id].allOnline = false
    }
    if(allOnline === true ) {
        onlineCache[guild.id].allOnline = true
    }
}
async function isPlayingGame(steamId) {
    try {
        const response = await axios.get(`https://steamcommunity.com/profiles/${steamId}/`);
        const html = response.data;
        
        const $ = cheerio.load(html);
        
        return $('.profile_in_game_name').length > 0
    } catch (error) {
        console.error(error);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { start };
