const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const cheerio = require('cheerio');
const https = require('https');
const fs = require("fs");
const filePath = './src/logs/setup.json'

let cachedServers = {};
const INTERVAL = 15;

let client
function start(newClient) {
    client = newClient;
    setInterval(() => {
        parseWebsite('https://cdn2.arkdedicated.com/servers/asa/officialserverlist.json');
    }, INTERVAL * 1000);
}

function createTribeEmbed(title) {
    return new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(title)
        .setTimestamp();
}

async function parseWebsite(url) {
    try {
        const data = await fetchData(url).then(jsonData => {
            const servers = JSON.parse(jsonData);
            
            function findServerByName(serverNumber) {
                const foundServers = servers.find(server => {
                   const regex = /(\d+)/;
                    const match = server.SessionName.match(regex);
                    if (match && match[0] === serverNumber) {
                        return true;
                    }
                    return false;
                });
                if (foundServers.length > 0) {
                    const prevData = cachedServers[serverNumber] || [];
                    if (!arraysEqual(prevData, foundServers)) {
                        cachedServers[serverNumber] = foundServers;
                        update(true, foundServers);
                    }
                    return foundServers;
                } else {
                    return null;
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
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

async function update(notify, foundServers) {
    try {
        const info = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rates')
            .setTimestamp();

        let description = '';

        foundServers.forEach((server, index) => {
            info.addFields()
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