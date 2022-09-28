const { Permissions } = require('discord.js');
const config = require("./config.json");
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Setup a log channel', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'channel', // Must be lower case
            description: 'Select a log channel. Select again to delete it.',
            required: true,
            type: 7, // This argument is a channel
        },
    ],

    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });

        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        var channelid = interaction.options.get('channel')
        let serverid = interaction.guild.id

        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/logchannel\` WAS EXECUTED BY \`${interaction.user.username}\`\n CHANNEL \`${channelid}\``
        })

        if (botMember.permissions.has([Permissions.FLAGS.VIEW_AUDIT_LOG]) === false) {
            // No send messages permission
            interaction.reply({
                content: `:x: **I need the following permissions to be able to opreate**
\`VIEW AUDIT LOG\` To be able to view who was granted/removed a role
\`SEND MESSAGES\` To send messages`, ephemeral: true, allowedMentions: { repliedUser: false }
            })
            return false;
        }

        async function getPermitedRoles() {
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'logchannel') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'logchannel'`);
                let verifyArr = []
                for (var i = 0; i < query[0].length; i++) {
                    verifyArr.push(query[0][i].role_id)
                }
                return verifyArr;
            }
        }

        let verifyArr = await getPermitedRoles()
        function checkUserRoles() {
            let checkRoles = []
            if (verifyArr.includes(false) === false) {
                for (var i = 0; i < verifyArr.length; i++) {
                    checkRoles.push(member.roles.cache.has(verifyArr[i]))
                }
                return checkRoles;
            } else {
                checkRoles.push(null)
                return checkRoles;
            }
        }
        let userHaveRolesArray = checkUserRoles()
        let boolCheckUserRoles = userHaveRolesArray.includes(true)
        // Execute only if member have permissions
        if (member.permissions.has([Permissions.FLAGS.MANAGE_GUILD]) === false && boolCheckUserRoles === false) {
            interaction.reply({
                content: `:x: You don't have \`MANAGE_GUILD\` permission or permited role to use this command`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }

        let fetchChannel = await interaction.guild.channels.fetch(channelid)
        if (!fetchChannel || fetchChannel.type != "GUILD_TEXT") {
            interaction.reply({
                content: `:x: **Invalid channel provided.** Please note that you can't select \`NEWS\` \`STORE\` or \`THREAD\` channels`, allowedMentions: { repliedUser: false }
            })
            return;
        }

        async function ifLogChannelExists() {
            // query database
            let query = await con2.execute(`SELECT EXISTS (SELECT server_id FROM logchannel WHERE server_id = '${serverid}') AS result;`);
            query = JSON.stringify(query[0]).match(/(\d)+/g)
            return query;
        }
        let boolIfLogChannelExists = await ifLogChannelExists()
        console.log(boolIfLogChannelExists[0])
        if (boolIfLogChannelExists[0] == 0) {
            await con2.execute(`INSERT INTO logchannel (server_id, channel_id) VALUES (${serverid},${channelid})`);
            interaction.reply({
                content: `Log channel <#${channelid}> has been **added**`, allowedMentions: { repliedUser: false }
            })
            return;
        } else {
            await con2.execute(`DELETE FROM logchannel WHERE server_id = '${serverid}'`);
            interaction.reply({
                content: `All log channels has been **deleted**`, allowedMentions: { repliedUser: false }
            })
            return;
        }

    },
}