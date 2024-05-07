const { guildArray } = require('../ready/log');


module.exports = (guild) => {

    console.log(`Successfully joined guild ${guild.name}`);

    const guildInfo = {
        id: guild.id,
        name: guild.name,
        channels: [],
    };

    guild.channels.cache.forEach(channel => {
        guildInfo.channels.push({
            id: channel.id,
            name: channel.name,
            type: channel.type,
        });
    });

    guildArray.push(guildInfo);
};