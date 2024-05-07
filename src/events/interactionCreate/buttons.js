const { guildArray } = require('../ready/log');
const fs = require("fs");
const filePath = './src/logs/setup.json'


module.exports = async (interaction) => {

    if (!interaction.isButton()) return;
    if (interaction.customId.toString().includes('accountNotify')) {
        const ID = interaction.customId.substring(0, interaction.customId.indexOf('.'));
        const GUILD = interaction.guild;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data[GUILD.id].accountRoleID != null) {
            const role = await GUILD.roles.cache.get(data[GUILD.id].accountRoleID);
            if (!role) {
                interaction.reply({
                    content: `Failed! No role setup (/rolesetup) to use this function!`,
                    ephemeral: true
                });
            }

            const user = interaction.member;
            let roleId = role.id;
            const guild = interaction.guild;
            await guild.members.fetch();
            const botMember = guild.members.cache.get(interaction.client.user.id);
            if(botMember.permissions.has('MANAGE_ROLES')) {
                if (role.comparePositionTo(botMember.roles.highest) < 0) {
                    if (user.roles.cache.some(role => role.id === roleId)) {
                        await user.roles.remove(role)
                        interaction.reply({
                            content: `Success! You will no longer be notified when an account is free!`,
                            ephemeral: true
                        });
                    } else {
                        await user.roles.add(role)
                        interaction.reply({
                            content: `Success! You will now be notified when an account is free!`,
                            ephemeral: true
                        });
                    }
                } else {
                    interaction.reply({
                        content: `Failed! Bot role must be higher than the role its assigning`,
                        ephemeral: true
                    });
                }
            } else {
                interaction.reply({
                    content: `Failed! Bot is missing permission MANAGE_ROLES`,
                    ephemeral: true
                });
            }
        } else interaction.reply({
            content: `Failed! No role setup (/rolesetup) to use this function!`,
            ephemeral: true
        });

    }
    if (interaction.customId.toString().includes('ratesNotify')) {
        const ID = interaction.customId.substring(0, interaction.customId.indexOf('.'));
        console.log(ID);
        const GUILD = interaction.guild;

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data[GUILD.id].ratesRoleID != null) {
            const role = await GUILD.roles.cache.get(data[GUILD.id].ratesRoleID);
            if (!role) {
                interaction.reply({
                    content: `Failed! No role setup (/rolesetup) to use this function!`,
                    ephemeral: true
                });
            }

            const user = interaction.member;
            let roleId = role.id;
            if (user.roles.cache.some(role => role.id === roleId)) {
                await user.roles.remove(role)
                interaction.reply({
                    content: `Success! You will no longer be notified when rates change!`,
                    ephemeral: true
                });
            } else {
                await user.roles.add(role)
                interaction.reply({
                    content: `Success! You will now be notified when rates change!`,
                    ephemeral: true
                });
            }
        } else interaction.reply({
            content: `Failed! No role setup (/rolesetup) to use this function!`,
            ephemeral: true
        });

    }
};