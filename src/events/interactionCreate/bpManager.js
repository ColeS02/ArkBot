const { guildArray } = require('../ready/log');
const fs = require("fs");
const filePath = './src/logs/setup.json'
const allBps = require("../../logs/bps/allBPTypes.json")


module.exports = async (interaction) => {
    if(interaction.isButton()) return;
    
    if(interaction.commandName === 'bp' || interaction.commandName === 'addbp') {
        if(!interaction.isAutocomplete()) return;

        const focusedValue = interaction.options.getFocused();
        const filteredChoices = allBps.filter((blueprint) => {
            const words = blueprint.name.split(/\s+/);
            const focusedValueLowerCase = focusedValue.toLowerCase();

            // Check if any individual word starts with the focused value
            const individualWordMatch = words.some((word) => word.toLowerCase().startsWith(focusedValueLowerCase));

            // Check if the joined words start with the focused value
            const combinedWordsMatch = words.join(' ').toLowerCase().startsWith(focusedValueLowerCase);

            return individualWordMatch || combinedWordsMatch;
        });

        const results = filteredChoices.map((choices) => {
            return {
                name: `${choices.name}`,
                value: `${choices.value}`
            }
        })

        interaction.respond(results.slice(0,25)).catch(() => {});
    }
    if(interaction.commandName === 'setlogin' || interaction.commandName === 'account') {
        if(!interaction.isAutocomplete()) return;

	const trackedPlayers = require("../../logs/trackedPlayers.json")
        
        const focusedValue = interaction.options.getFocused();
        const guildData = trackedPlayers[interaction.guild.id];
        console.log(guildData)
        const filteredChoices = Object.keys(guildData).filter((blueprint) => {
            console.log(blueprint)
            const words = blueprint.split(/\s+/);
            const focusedValueLowerCase = focusedValue.toLowerCase();

            // Check if any individual word starts with the focused value
            const individualWordMatch = words.some((word) => word.toLowerCase().startsWith(focusedValueLowerCase));

            // Check if the joined words start with the focused value
            const combinedWordsMatch = words.join(' ').toLowerCase().startsWith(focusedValueLowerCase);

            return individualWordMatch || combinedWordsMatch;
        });

        const results = filteredChoices.map((choices) => {
            console.log(choices)
            return {
                name: choices,
                value: choices
            }
        })

        interaction.respond(results.slice(0,25)).catch(() => {});
    }
};