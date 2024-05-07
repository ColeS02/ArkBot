const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require("fs");
const cheerio = require('cheerio');
const https = require('https');
const filePath = './src/logs/setup.json'
const { guildArray } = require('../events/ready/log');

let cachedLines = [];
const INTERVAL = 15;

let client

function start(newClient) {
    client = newClient;
    setInterval(() => {
        parseWebsite('https://cdn2.arkdedicated.com/asa/smalltribes_dynamicconfig.ini');
    }, INTERVAL * 1000);
}
async function update(notify) {
    try {
        const info = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rates')
            .setTimestamp();

        let description = '';

        cachedLines.forEach((line) => {
            const [key, value] = line.split('=');

            switch (key.trim()) {
                case 'TamingSpeedMultiplier':
                    description += `Tame: \`${parseFloat(value.trim())}\``;
                    break;
                case 'HarvestAmountMultiplier':
                    description += `\nGather: \`${parseFloat(value.trim())}\``;
                    break;
                case 'XPMultiplier':
                    description += `\nXP: \`${parseFloat(value.trim())}\``;
                    break;
                case 'MatingIntervalMultiplier':
                    description += `\nMating Interval: \`${parseFloat(value.trim())}\``;
                    break;
                case 'BabyMatureSpeedMultiplier':
                    description += `\nMaturation: \`${parseFloat(value.trim())}\``;
                    break;
                case 'EggHatchSpeedMultiplier':
                    description += `\nHatch Speed: \`${parseFloat(value.trim())}\``;
                    break;
                case 'BabyCuddleIntervalMultiplier':
                    description += `\nCuddle Interval: \`${parseFloat(value.trim())}\``;
                    break;
                case 'BabyImprintAmountMultiplier':
                    description += `\nImprint Multiplier: \`${parseFloat(value.trim())}\``;
                    break;
                case 'HexagonRewardMultiplier':
                    description += `\nHexagon Multplier: \`${parseFloat(value.trim())}\``;
                    break;
                default:
                    break;
            }
        });

        description += `\n\nUpdated: <t:${Math.floor(Date.now() / 1000)}:R>`;
        
        info.setDescription(description);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                try {
                    const guild = await client.guilds.fetch(key);
                    const ratesChannel = guild.channels.cache.get(data[key].ratesChannel);
                    const message = await ratesChannel.messages.fetch(data[key].ratesMessageID)

                    message.edit({ embeds: [info] });
                    if(notify) {
                        if(data[key].ratesRoleID != null) {
                            ratesChannel.send('<@&' + data[key].ratesRoleID + '> Rates have changed!').then(message => {
                                setTimeout(() => {
                                    try {
                                        message.delete();
                                    } catch(error) {
                                        
                                    }
                                }, 10 * 1000);
                            })
                        }
                    }
                }  catch(error) {
                    console.log(`RATES: Guild ID: ${key} is not available.`)
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function parseWebsite(url) {
    try {
        const data = await fetchData(url);
        const lines = data.split('\n');
        if(cachedLines.length === 0) {
            cachedLines = lines;
            await update(false);
        }
        if (cachedLines.length > 0 && !arraysEqual(cachedLines, lines)) {
            const setupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            await update(true);
        }
        cachedLines = lines;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

module.exports = { start };