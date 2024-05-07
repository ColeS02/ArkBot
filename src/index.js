require('dotenv').config();
const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActivityType } = require('discord.js');
const fs = require("fs");
const { CommandKit } = require('commandkit');
const accounts = require('./runnables/accounts');
const rates = require('./runnables/rates');


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildInvites,
    ],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    bulkRegister: true,
})

client.login(process.env.TOKEN);

client.on('ready', () => {
    accounts.start(client);
    rates.start(client);
});


