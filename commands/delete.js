const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const fs = require("fs");
module.exports = {
    name: "delete",
    category: 'All',
    guildOnly: true,
    description: 'Delete selected Role Menu emojis', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'message_link', // Must be lower case
            description: 'Link to the message that reactions will be applied to. PPM on message > copy message link',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'emojis', // Must be lower case
            description: 'SEPARATE BY COMMA `,` |  Role Menus that you want to delete',
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
        // Prepare bot client, the member that called the command and the channel that command was called in
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let serverid = interaction.guild.id
        var messageLinkArg = interaction.options.get('message_link').value;
        var emojiArg = interaction.options.get('emojis').value;

        const logChannel = client.channels.cache.get('606224251443478530')
        const commandChannel = client.channels.cache.get('923378105454841856')
        commandChannel.send({
            content: `${getDate()} COMMAND \`/delete\` WAS EXECUTED BY \`${interaction.user.username}\`\nMESSAGE_LINK: \`${messageLinkArg}\`\nEMOJI: ${emojiArg}`
        })
        // Execute only if bot client have permissions
        if (botMember.permissions.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.SEND_MESSAGES]) === false) {
            // No send messages permission
            interaction.reply({
                content: `:x: **I need the following permissions to be able to opreate**
\`MANAGE ROLES\` To add roles to users
\`MANAGE MESSAGES\` To remove reactions
\`ADD REACTIONS\` - To add reactions
\`SEND MESSAGES\` To send messages`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
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

        async function getPermitedRoles() {
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'delete') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'delete'`);
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

        const messageRegex = messageLinkArg.match(/[0-9]{2}([0-9]{5})[0-9]+/g)
        let channelID = messageRegex[1].toString()
        let messageID = messageRegex[2].toString()
        const channel = await interaction.guild.channels.fetch(channelID)
        const message = await channel.messages.fetch(messageID)

        async function doesReactionMenuExists() {
            let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID}') AS result;`);
            query = query[0][0].result
            if (query == 1) {
                return true;
            } else {
                return false;
            }
        }

        let boolDoesReactionMenuExists = await doesReactionMenuExists()

        if (!message || boolDoesReactionMenuExists === false) {
            interaction.reply({
                content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { repliedUser: false }
            })
            return false;
        }

        // Get the array of emoji and roles and remove white spaces
        let emojiArr = emojiArg.split(",")

        if (emojiArr.length > 19) {
            interaction.reply({
                content: `:x: Discord allows max 20 reactions per message`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }

        //Validate if inputed values are indeed emojis
        async function validateEmojis(value) {

            if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(value)) {
                var emojiid = value
                checkEmojiArr.push(true)
                return true;
            } else {
                let id = value.match(/(\d)+/g)
                try {
                    if (interaction.guild.emojis.cache.get(id.toString())) {
                        var emojiid = id
                        checkEmojiArr.push(true)
                        return true;
                    } else {
                        interaction.reply({
                            content: `:x: At least one of provided emojis doesen't exists on this server`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        checkEmojiArr.push(false)
                        return false;
                    }
                }
                catch (err) {
                    interaction.reply({
                        content: `:x: At least one of provided emojis is invalid`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    checkEmojiArr.push(false)
                    return false;
                }
            }
        }

        let checkEmojiArr = []
        for (var i = 0; i < emojiArr.length; i++) {
            emojiArr[i] = emojiArr[i].replace(/ /g, '')
            validateEmojis(emojiArr[i])
        }
        let boolValidateEmojis = checkEmojiArr.every(checkList);

        function checkList(has_role) {
            return has_role == true
        }

        for (var i = 0; i < emojiArr.length; i++) {
            let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID[0]}' AND emoji = '${emojiArr[i]}') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                interaction.reply({
                    content: `:x: At least one of provided emojis doesen't exists on the original message`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return;
            }
        }

        //if validate is true attach emoijis
        if (boolValidateEmojis === true) {
            deleteReactionRole(emojiArr);
        } else {
            return
        }

        async function deleteReactionRole(emojiArr) {

            //iterate through every old emoji and remove it
            for (var i = 0; i < emojiArr.length; i++) {
                if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(emojiArr[i])) {
                    var id = emojiArr[i]
                    message.reactions.cache.get(id).remove().catch(error => {
                        interaction.reply({
                            content: `:x: I don't have permission to remove emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                } else {
                    var id = emojiArr[i].match(/(\d)+/g)
                    message.reactions.cache.get(id[0]).remove().catch(error => {
                        interaction.reply({
                            content: `:x: I don't have permission to remove emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                }
            }

            //log it to the database
            for (var i = 0; i < emojiArr.length; i++) {
                emojiID = emojiArr[i]
                var fetchMessage = await channel.messages.fetch(messageID)
                await con2.execute(`DELETE FROM reactionrole WHERE message_id = "${messageID}" AND emoji = "${emojiID}"`);
                const deletedLog = fs.createWriteStream('dbdeetels.txt', { flags: 'a', encoding: 'utf8' });
                deletedLog.write(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
                logChannel.send({
                    content: `${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``
                })
                console.log(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
            }

            let embedDesc = "";
            for (var i = 0; i < emojiArr.length; i++) {
                embedDesc += `${emojiArr[i]}\n`
            }

            interaction.reply({
                content: `**Role Menu has been sucessfuly deleted**!\nDeleted:\n${embedDesc}\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }
    },
}