const { Permissions } = require('discord.js');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Show all information about provided Role Menu', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'message_link', // Must be lower case
            description: 'Link to the message with Role Menu attached',
            required: true,
            type: 3, // This argument is a string
        },
    ],
    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        let member = interaction.member
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let serverid = interaction.guild.id
        let messageLinkArg = interaction.options.get('message_link')

        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/info\` WAS EXECUTED BY \`${interaction.user.username}\`\n MESSAGE_LINK: \`${messageLink}\``
        })


        //Prepare database connection
        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });

        async function getPermitedRoles() {
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'info') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'info'`);
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
                verifyEnabled = true
                for (var i = 0; i < verifyArr.length; i++) {
                    checkRoles.push(member.roles.cache.has(verifyArr[i]))
                }
                return checkRoles;
            } else {
                checkRoles.push(true)
                verifyEnabled = false
                return checkRoles;
            }
        }
        let userHaveRolesArray = checkUserRoles()
        let boolCheckUserRoles = userHaveRolesArray.includes(true)
        // Execute only if member have permissions

        if (verifyEnabled === true) {
            if (member.permissions.has([Permissions.FLAGS.MANAGE_GUILD]) === false && boolCheckUserRoles === false) {
                interaction.reply({
                    content: `:x: You don't have permited role to use this command`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return false;
            }
        }

        async function doesReactionMenuExists() {
            let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID}') AS result;`);
            query = JSON.stringify(query[0]).match(/(\d)+/g)
            if (query == 1) {
                return true;
            } else {
                return false;
            }
        }
        let messageLink = messageLinkArg
        const messageRegex = messageLink.match(/[0-9]{2}([0-9]{5})[0-9]+/g)
        let channelID = messageRegex[1].toString()
        let messageID = messageRegex[2].toString()
        const channel = await interaction.guild.channels.fetch(channelID)
        const message = await channel.messages.fetch(messageID)

        let boolDoesReactionMenuExists = await doesReactionMenuExists()

        if (!message || boolDoesReactionMenuExists === false) {
            interaction.reply({
                content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { repliedUser: false }
            })
            return false;
        }

        let infoQuery = await con2.execute(`SELECT message_id, role_id, emoji, max, duration, slowmode FROM reactionrole WHERE message_id = '${messageID}'`);
        await interaction.reply({
            content: `Just a second...`, ephemeral: false, allowedMentions: { repliedUser: false }
        })

        let embedThings = "";
        for (var i = 0; i < infoQuery[0].length; i++) {
            embedThings += `\n<@&${infoQuery[0][i].role_id}> -> ${infoQuery[0][i].emoji}`
        }

        let whiteListExist = await con2.execute(`SELECT EXISTS (SELECT message_id FROM whitelist WHERE message_id = '${messageID}') AS result;`);
        if (whiteListExist[0][0].result == 1) {
            let WLfetchRoles = await con2.execute(`SELECT role_id FROM whitelist WHERE message_id = '${messageID}'`);
            var WLmenuRoles = []
            for (var i = 0; i < WLfetchRoles[0].length; i++) {
                console.log(WLfetchRoles[0][0].role_id)
                if (WLfetchRoles[0][0].role_id == "none") {
                    var WLmenuRoles = "none"
                    break;
                }
                WLmenuRoles.push(`\n<@&${WLfetchRoles[0][i].role_id}>`)
            }
        } else {
            var WLmenuRoles = "none"
        }

        let blackListExist = await con2.execute(`SELECT EXISTS (SELECT message_id FROM blacklist WHERE message_id = '${messageID}') AS result;`);
        if (blackListExist[0][0].result == 1) {
            let BLfetchRoles = await con2.execute(`SELECT role_id FROM blacklist WHERE message_id = '${messageID}'`);
            var BLmenuRoles = []
            for (var i = 0; i < BLfetchRoles[0].length; i++) {
                console.log(BLfetchRoles[0][0].role_id)
                if (BLfetchRoles[0][0].role_id == "none") {
                    var BLmenuRoles = "none"
                    break;
                }
                BLmenuRoles.push(`\n<@&${BLfetchRoles[0][i].role_id}>`)
            }
        } else {
            var BLmenuRoles = "none"
        }

        var infoEmbed = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`ID: ${messageID}`)
            .setURL(messageLinkArg)
            .setAuthor(`Reaction Menu Info for ${interaction.guild.name}`, interaction.guild.iconURL)
            .addFields(
                { name: 'Emojis & Roles', value: `${embedThings}`, inline: false },
                { name: 'Whitelisted Roles', value: `${WLmenuRoles}`, inline: false },
                { name: 'Blacklisted Roles', value: `${BLmenuRoles}`, inline: false },
                { name: 'Max', value: `${infoQuery[0][0].max}`, inline: true },
                { name: 'Duration', value: `${infoQuery[0][0].duration}`, inline: true },
                { name: 'slowmode', value: `${infoQuery[0][0].slowmode}`, inline: true },
            )
        await interaction.editReply({ embeds: [infoEmbed], allowedMentions: { parse: [] } });
    },
}