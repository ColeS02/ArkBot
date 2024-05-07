let guildArray = [];

module.exports = (client) => {

    console.log(`Logged in as ${client.user.tag}!`);
    const guilds = client.guilds.cache;
    
    client.guilds.cache.forEach(guild => {
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
    });

};

module.exports.guildArray = guildArray;