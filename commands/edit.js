const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const fs = require("fs");
const { duration } = require('moment');
module.exports = {
    name: "edit",
    description: 'Edit emojis / roles in the Role Menu', // Required for slash commands
    category: 'All',
    guildOnly: true,
    slash: true,
    testOnly: false,
    options: [
        {
            name: "emoji",
            description: 'Edit emojis assigned to Role Menu message', // Required for slash commands
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'old_emojis', // Must be lower case
                    description: 'SEPARATE BY COMMA `,` |  Emoji that you want to replace',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_emojis', // Must be lower case
                    description: 'SEPARATE BY COMMA `,` |  Emoji that you want to add',
                    required: true,
                    type: 3, // This argument is a string
                }
            ],
        },
        {
            name: "role",
            description: 'Edit roles assigned to Role Menu message', // Required for slash commands
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'old_roles', // Must be lower case
                    description: '@MENTION SEPARATE BY COMMA `,` |  Role that you want to replace',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_roles', // Must be lower case
                    description: '@MENTION SEPARATE BY COMMA `,` |  Role that you want to add',
                    required: true,
                    type: 3, // This argument is a string
                }
            ],
        },
        {
            name: "max",
            description: 'Edit how many roles can a user give to themselves from the Role Menu. 0 - infinite', // Required for slash commands
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_max', // Must be lower case
                    description: 'How many roles can a user give to themselves from the Role Menu. 0 - infinite',
                    required: true,
                    type: 4, // This argument is an int
                }
            ]
        },
        {
            name: "duration",
            description: "Overwtie duration",
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_duration', // Must be lower case
                    description: 'Edit after what time in minutes the role will be revoked. 0 - doesn\'t expire',
                    required: true,
                    type: 4, // This argument is an int
                }
            ],
        },
        {
            name: "slowmode",
            description: "Overwtie slowmode",
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_slowmode', // Must be lower case
                    description: 'Edit How fast can user interact with Role Menu in minutes. 0 - no limit.',
                    required: true,
                    type: 4, // This argument is an int
                }
            ],
        },
        {
            name: "whitelisted_role",
            description: "Overwtie whitelisted roles",
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_role', // Must be lower case
                    description: '@MENTION SEPARATE BY COMMA `,` | Overwtie whitelisted roles. "none" to disable',
                    required: true,
                    type: 3, // This argument is a string
                }
            ],
        },
        {
            name: "blacklisted_role",
            description: "Overwtie blacklisted roles",
            type: 1, // 1 is type SUB_COMMAND
            options: [
                {
                    name: 'message_link', // Must be lower case
                    description: 'Link to the message that you want to edit. PPM on message > copy message link',
                    required: true,
                    type: 3, // This argument is a string
                },
                {
                    name: 'new_role', // Must be lower case
                    description: '@MENTION SEPARATE BY COMMA `,` | Overwtie blacklisted roles. "none" to disable',
                    required: true,
                    type: 3, // This argument is a string
                }
            ],
        },
    ],

    callback: async ({ interaction, client }) => {

        /* ############################################################## *
        * ------------------- RETREIVE ARGUMENTS DATA ------------------- *
        *  ############################################################## */
        switch (interaction.options._subcommand) {
            case "emoji":
                var commandName = "editemoji"
                var messageLinkArg = interaction.options.get('message_link').value;
                var emojiArg = interaction.options.get('old_emojis').value;
                var newEmojiArg = interaction.options.get('new_emojis').value;
                var roleArg = null
                var newRoleArg = null
                var whiteListedRoleArg = null
                var maxArg = null
                var durationArg = null
                var slowmodeArg = null
                var blackListedRoleArg = null
                break;
            case "role":
                var commandName = "editrole"
                var messageLinkArg = interaction.options.get('message_link').value;
                var roleArg = interaction.options.get('old_roles').value;
                var newRoleArg = interaction.options.get('new_roles').value;
                var emojiArg = null
                var newEmojiArg = null
                var whiteListedRoleArg = null
                var maxArg = null
                var durationArg = null
                var slowmodeArg = null
                var blackListedRoleArg = null
                break;
            case "max":
                var commandName = "editmax"
                var messageLinkArg = interaction.options.get('message_link').value;
                var maxArg = interaction.options.get('new_max').value;
                var roleArg = null
                var newRoleArg = null
                var emojiArg = null
                var newEmojiArg = null
                var whiteListedRoleArg = null
                var durationArg = null
                var slowmodeArg = null
                var blackListedRoleArg = null
                break;
            case "whitelisted_role":
                var commandName = "editwhitelistedrole"
                var messageLinkArg = interaction.options.get('message_link').value;
                var whiteListedRoleArg = interaction.options.get('new_role').value;
                var roleArg = null
                var newRoleArg = null
                var emojiArg = null
                var newEmojiArg = null
                var maxArg = null
                var durationArg = null
                var slowmodeArg = null
                var blackListedRoleArg = null
                break;
            case "blacklisted_role":
                var commandName = "editblacklistedrole"
                var messageLinkArg = interaction.options.get('message_link').value;
                var blackListedRoleArg = interaction.options.get('new_role').value;
                var whiteListedRoleArg = null
                var roleArg = null
                var newRoleArg = null
                var emojiArg = null
                var newEmojiArg = null
                var maxArg = null
                var durationArg = null
                var slowmodeArg = null
                break;
            case "duration":
                var commandName = "editduration"
                var messageLinkArg = interaction.options.get('message_link').value;
                var durationArg = interaction.options.get('new_duration').value;
                var roleArg = null
                var newRoleArg = null
                var emojiArg = null
                var newEmojiArg = null
                var maxArg = null
                var whiteListedRoleArg = null
                var slowmodeArg = null
                var blackListedRoleArg = null
                break;
            case "slowmode":
                var commandName = "editslowmode"
                var messageLinkArg = interaction.options.get('message_link').value;
                var slowmodeArg = interaction.options.get('new_slowmode').value;
                var roleArg = null
                var newRoleArg = null
                var emojiArg = null
                var newEmojiArg = null
                var maxArg = null
                var whiteListedRoleArg = null
                var durationArg = null
                var blackListedRoleArg = null
                break;
            default:
                console.log("Something went wrong when retrieving command group info")
        }
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        /* ############################################################## *
        * ------------------------- BASE COMMAND ------------------------ *
        *  ############################################################## */

        //Prepare bot client, the member that called the command and the channel that command was called in
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let serverid = interaction.guild.id

        const logChannel = client.channels.cache.get('606224251443478530')
        const commandChannel = client.channels.cache.get('923378105454841856')
        var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
        commandChannel.send({
            content: `${getDate()} COMMAND \`/edit\` WAS EXECUTED BY \`${interaction.user.username}\`\COMMAND_NAME: \`${commandName}\`\nnMESSAGE_LINK: ${messageLinkArg}\nEMOJI: ${emojiArg}\nNEW EMOJI: ${newEmojiArg}\nROLE: \\${roleArg}\nNEW ROLE: \\${newRoleArg}\nWHITELISTED: \\${whiteListedRoleArg}\nBLACKLISTED: \\${blackListedRoleArg}\nMAX: \`${maxArg}\`\nDURATION: \`${durationArg}\`\nSLOWMODE: \`${slowmodeArg}\`
            \`\`\`ini
            [END OF THE LINE]
            \`\`\``
        })
        await interaction.deferReply({ ephemeral: true });
        //Execute only if bot client have permissions
        if (botMember.permissions.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.SEND_MESSAGES]) === false) {
            //No send messages permission
            interaction.editReply({
                content: `:x: **I need the following permissions to be able to opreate**
\`MANAGE ROLES\` To add roles to users
\`MANAGE MESSAGES\` To remove reactions
\`ADD REACTIONS\` - To add reactions
\`SEND MESSAGES\` To send messages`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }

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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'edit') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'edit'`);
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
            interaction.editReply({
                content: `:x: You don't have \`MANAGE_GUILD\` permission or permited role to use this command`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }

        let messageLink = messageLinkArg
        const messageRegex = messageLink.match(/[0-9]{2}([0-9]{5})[0-9]+/g)
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
            interaction.editReply({
                content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { repliedUser: false }
            })
            return false;
        }

        switch (commandName) {
            case "editemoji":
                let emojiArr = emojiArg.split(",")
                let newEmojiArr = newEmojiArg.split(",")

                if (emojiArr.length !== newEmojiArr.length) {
                    interaction.editReply({
                        content: `:x: Old emoji and new emoji count mismatch.`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    return;
                }

                var checkEmojiArr = []
                for (var i = 0; i < emojiArr.length; i++) {
                    emojiArr[i] = emojiArr[i].replace(/ /g, '')
                    await validateEmojis(emojiArr[i])
                    if (checkEmojiArr.includes(false) === true) {
                        var boolValidateEmojis = false;
                        break;
                    } else {
                        var boolValidateEmojis = true;
                    }
                }
                if (boolValidateEmojis === true) {
                    var checkEmojiArr = []
                    for (var i = 0; i < emojiArr.length; i++) {
                        newEmojiArr[i] = newEmojiArr[i].replace(/ /g, '')
                        await validateEmojis(newEmojiArr[i])
                        if (checkEmojiArr.includes(false) === true) {
                            var boolValidateNewEmojis = false;
                            break;
                        } else {
                            var boolValidateNewEmojis = true;
                        }
                    }
                }

                if (boolValidateEmojis === false || boolValidateNewEmojis === false) {
                    return
                }

                for (var i = 0; i < emojiArr.length; i++) {
                    let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${emojiArr[i]}') AS result;`);
                    query = query[0][0].result
                    if (query == 0) {
                        interaction.editReply({
                            content: `:x: At least one of provided emojis doesen't exists on the original message`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    }
                }

                editEmoji(emojiArr, newEmojiArr);
                break;

            case "editrole":
                let roleArr = roleArg.split(",")
                let newRoleArr = newRoleArg.split(",")

                if (roleArr.length !== newRoleArr.length) {
                    interaction.editReply({
                        content: `:x: Old roles and new roles count mismatch.`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    return;
                }

                var checkRoleArr = []
                for (var i = 0; i < roleArr.length; i++) {
                    roleArr[i] = roleArr[i].replace(/ /g, '')
                    await validateRoles(roleArr[i])
                    if (checkRoleArr.includes(false) === true) {
                        var boolValidateRoles = false;
                        break;
                    } else {
                        var boolValidateRoles = true;
                    }
                }
                if (boolValidateRoles === true) {
                    var checkRoleArr = []
                    for (var i = 0; i < roleArr.length; i++) {
                        newRoleArr[i] = newRoleArr[i].replace(/ /g, '')
                        await validateRoles(newRoleArr[i])
                        if (checkRoleArr.includes(false) === true) {
                            var boolValidateNewRoles = false;
                            break;
                        } else {
                            var boolValidateNewRoles = true
                        }
                    }
                }

                if (boolValidateRoles === false || boolValidateNewRoles === false) {
                    return
                }

                for (var i = 0; i < roleArr.length; i++) {
                    var roleID = roleArr[i].match(/(\d)+/g).toString();
                    let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID}' AND role_id = '${roleID}') AS result;`);
                    query = query[0][0].result
                    if (query == 0) {
                        interaction.editReply({
                            content: `:x: At least one of provided roles doesen't exists on the original message`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    }
                }

                editRole(roleArr, newRoleArr);
                break;

            case "editmax":
                editMax();
                break;
            case "editduration":
                editDuration();
                break;
            case "editslowmode":
                editslowmode();
                break;
            case "editwhitelistedrole":
                let verifyWLarr = whiteListedRoleArg.split(",")

                var checkRoleArr = []
                for (var i = 0; i < verifyWLarr.length; i++) {
                    verifyWLarr[i] = verifyWLarr[i].replace(/ /g, '')
                    await validateRoles(verifyWLarr[i])
                    if (checkRoleArr.includes(false) === true) {
                        var boolValidateWhiteList = false;
                        break;
                    } else {
                        var boolValidateWhiteList = true;
                    }
                }

                if (boolValidateWhiteList === false) {
                    return
                }

                editWhiteListedRole(verifyWLarr);

                break;
            case "editblacklistedrole":
                let verifyBLarr = blackListedRoleArg.split(",")

                var checkRoleArr = []
                for (var i = 0; i < verifyBLarr.length; i++) {
                    verifyBLarr[i] = verifyBLarr[i].replace(/ /g, '')
                    await validateRoles(verifyBLarr[i])
                    if (checkRoleArr.includes(false) === true) {
                        var boolValidateBlackList = false;
                        break;
                    } else {
                        var boolValidateBlackList = true;
                    }
                }

                if (boolValidateBlackList === false) {
                    return
                }

                editBlackListedRole(verifyBLarr);
                break;

            default:
                console.log("Something went wrong when trying to receive command name")
        }

        //Validate if inputed values are indeed emojis
        async function validateEmojis(value) {
            if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(value)) {
                var emojiid = value
                checkEmojiArr.push(true)
                return true;
            } else {
                let id = value.match(/(\d)+.$/g)
                if (id); else {
                    checkEmojiArr.push(false)
                    interaction.editReply({
                        content: `:x: At least one of the provided emojis doesen't exist`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    return;
                }
                id = id[0].slice(0, -1)
                try {
                    await interaction.guild.emojis.fetch()
                    let fetchEmoiji = interaction.guild.emojis.cache.get(id.toString())
                    if (fetchEmoiji) {
                        var emojiid = id
                        checkEmojiArr.push(true)
                        return true;
                    } else {
                        interaction.editReply({
                            content: `:x: At least one of provided emojis doesen't exists on this server`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        checkEmojiArr.push(false)
                        return false;
                    }
                }
                catch (err) {
                    interaction.editReply({
                        content: `:x: At least one of provided emojis is invalid`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    checkEmojiArr.push(false)
                    return false;
                }
            }
        }

        //Validate if inputed values are indeed mentioned and assignable roles
        async function validateRoles(value) {
            //Extract numbers from role
            if (value == "@everyone" || value == "@here") {
                interaction.editReply({
                    content: `:x: You can't assign ${value} role. To remove Whitelist/Blacklist use \`none\` as the parameter.`, ephemeral: true, allowedMentions: { parse: [] }
                })
                checkRoleArr.push(false)
                return false;
            }
            try {
                var roleID = value.match(/(\d)+/g).toString();
            } catch (e) {
                //If it doesen't contain any return false
                interaction.editReply({
                    content: `:x: At least one of provided roles is invalid`, ephemeral: true, allowedMentions: { parse: [] }
                })
                checkRoleArr.push(false)
                return false;
            }
            //Fetch role, if it can't be fetch return false
            let fetchRole = await interaction.guild.roles.fetch(roleID)
            if (fetchRole) {
                //If it's @everyone @herer or is not assignable return false
                if (fetchRole.rawPosition === 0 || fetchRole.managed === true) {
                    interaction.editReply({
                        content: `:x: You can't assign this role because it's either nitro booster role or it's manageable automaticly`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    checkRoleArr.push(false)
                    return false;
                }
                //return true if role can be fetched it's not @everyone @here or the role is assignable
                else {
                    checkRoleArr.push(true)
                    return true;
                }
                //if it can't be fetched return false
            } else {
                interaction.editReply({
                    content: `:x: At least one of provided roles is invalid`, ephemeral: true, allowedMentions: { parse: [] }
                })
                checkRoleArr.push(false)
                return false;
            }
        }

        /* ############################################################## *
        *  ---------------------- COMMAND FUNCTIONS --------------------- *
        *  ############################################################## */

        async function editEmoji(emojiArr, newEmojiArr) {

            if (emojiArr.length > 19) {
                interaction.editReply({
                    content: `:x: Discord allows max 20 reactions per message`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return false;
            }

            //iterate through every old emoji and remove it
            for (var i = 0; i < emojiArr.length; i++) {
                if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(emojiArr[i])) {
                    var id = emojiArr[i]
                    message.reactions.cache.get(id).remove().catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to remove emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                } else {
                    var id = emojiArr[i].match(/(\d)+/g)
                    message.reactions.cache.get(id[0]).remove().catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to remove emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                }
            }

            //iterate through every new emoji and add it
            for (var i = 0; i < newEmojiArr.length; i++) {
                if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(newEmojiArr[i])) {
                    var id = newEmojiArr[i]
                    await message.react(id).catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to add emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                } else {
                    var id = newEmojiArr[i].match(/(\d)+/g)
                    await message.react(id[0]).catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to add emojis`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                }
            }

            //log it to the database
            for (var i = 0; i < emojiArr.length; i++) {
                var fetchMessage = await channel.messages.fetch(messageID)

                oldEmojiID = emojiArr[i]
                emojiID = newEmojiArr[i]
                let query = await con2.execute(`SELECT role_id FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${oldEmojiID}'`);
                console.log(`SELECT role_id FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${emojiID}'`)
                query = query[0][0].role_id
                await con2.execute(`UPDATE reactionrole SET emoji = "${emojiID}" WHERE message_id = "${messageID}" AND role_id = "${query}";`);
                const editedLog = fs.createWriteStream('edits.txt', { flags: 'a', encoding: 'utf8' });
                editedLog.write(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
                logChannel.send({
                    content: `${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``
                })
                console.log(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
            }

            let embedDesc = "";
            for (var i = 0; i < newEmojiArr.length; i++) {
                embedDesc += `${emojiArr[i]} -> ${newEmojiArr[i]}\n`
            }

            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\n${embedDesc}\n To edit the embeded message type \`/editembed\`\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editRole(roleArr, newRoleArr) {

            if (roleArr.length > 19) {
                interaction.editReply({
                    content: `:x: Discord allows max 20 reactions per message`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return false;
            }

            //log it to the database
            for (var i = 0; i < roleArr.length; i++) {
                oldRoleID = roleArr[i].match(/(\d)+/g).toString()
                roleID = newRoleArr[i].match(/(\d)+/g).toString()
                var fetchMessage = await channel.messages.fetch(messageID)
                
                let query = await con2.execute(`SELECT emoji FROM reactionrole WHERE message_id = '${messageID}' AND role_id = '${oldRoleID}'`);
                query = query[0][0].emoji
                await con2.execute(`UPDATE reactionrole SET role_id = "${roleID}" WHERE message_id = '${messageID}' AND emoji = '${query}';`);
                const editedLog = fs.createWriteStream('edits.txt', { flags: 'a', encoding: 'utf8' });
                editedLog.write(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
                logChannel.send({
                    content: `${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``
                })
                console.log(`${getDate()} [EDIT] - EMOJI [${emojiID}]SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
            }

            let embedDesc = "";
            for (var i = 0; i < newRoleArr.length; i++) {
                embedDesc += `${roleArr[i]} -> ${newRoleArr[i]}\n`
            }

            if (!embedDesc) {
                embedDesc = "none"
            }

            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\n${embedDesc}\n To edit the embeded message type \`/editembed\`\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editWhiteListedRole(verifyWLarr) {
            //log it to the database
            if (verifyWLarr != "none") {
                await con2.execute(`DELETE FROM whitelist WHERE message_id = "${messageID}"`);
                var embedDesc = "";
                for (var i = 0; i < verifyWLarr.length; i++) {
                    var WLverifyID = verifyWLarr[i].match(/(\d)+/g).toString()
                    await con2.execute(`INSERT INTO whitelist (message_id, role_id) VALUES ('${messageID}', '${WLverifyID}');`);
                    embedDesc += `- ${verifyWLarr[i]}\n`
                }
            } else {
                await con2.execute(`DELETE FROM whitelist WHERE message_id = "${messageID}"`);
            }

            if (!embedDesc) {
                embedDesc = "none"
            }

            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\nNew whitelisted roles:\n${embedDesc}\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editBlackListedRole(verifyBLarr) {
            //log it to the database
            if (verifyBLarr != "none") {
                await con2.execute(`DELETE FROM blacklist WHERE message_id = "${messageID}"`);
                var embedDesc = "";
                for (var i = 0; i < verifyBLarr.length; i++) {
                    var BLverifyID = verifyBLarr[i].match(/(\d)+/g).toString()
                    await con2.execute(`INSERT INTO blacklist (message_id, role_id) VALUES ('${messageID}', '${BLverifyID}');`);
                    embedDesc += `- ${verifyBLarr[i]}\n`
                }
            } else {
                await con2.execute(`DELETE FROM blacklist WHERE message_id = "${messageID}"`);
            }

            if (!embedDesc) {
                embedDesc = "none"
            }

            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\nNew blacklisted roles:\n${embedDesc}\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editMax() {
            var max = maxArg
            await con2.execute(`UPDATE reactionrole SET max = "${max}" WHERE message_id = "${messageID}";`);
            if (max == 0) {
                max = "Reaction Limit has been disabled"
            }
            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\nNew max: **${max}**\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editDuration() {
            var newDuration = durationArg
            if (newDuration < 1) {
                await con2.execute(`DELETE FROM timedrole WHERE message_id = '${messageID}'`);
                await con2.execute(`UPDATE reactionrole SET duration = "${newDuration}" WHERE message_id = '${messageID}'`);
                interaction.editReply({
                    content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\Temporary Roles has been disabled\n\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return;
            }
            let oldDateEnding = await con2.execute(`SELECT date_ending FROM timedrole wHERE message_id = '${messageID}'`);
            for (var i = 0; i < oldDateEnding[0].length; i++) {
                let oldDateEnding = await con2.execute(`SELECT date_ending FROM timedrole wHERE message_id = '${messageID}'`);
                let checkOldDuration = await con2.execute(`SELECT duration FROM reactionrole wHERE message_id = '${messageID}'`);
                let oldDuration = parseInt(checkOldDuration[0][i].duration)
                if (newDuration > oldDuration) {
                    var newDateEnding = parseInt(oldDateEnding[0][i].date_ending) + newDuration * 60000 - oldDuration * 60000
                } else {
                    var newDateEnding = parseInt(oldDateEnding[0][i].date_ending) - newDuration * 60000 - oldDuration * 60000
                }
                await con2.execute(`UPDATE timedrole SET date_ending = "${newDateEnding}" WHERE message_id = '${messageID}';`);
            }

            await con2.execute(`UPDATE reactionrole SET duration = "${newDuration}" WHERE message_id = '${messageID}'`);
            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\nNew duration: **${newDuration}** minutes before the role will be revoked\n\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }

        async function editslowmode() {
            var newslowmode = slowmodeArg
            if (newslowmode < 1) {
                await con2.execute(`DELETE FROM slowmode WHERE message_id = '${messageID}'`);
                return;
            }
            let oldDateEnding = await con2.execute(`SELECT date_ending FROM slowmode wHERE message_id = '${messageID}'`);
            for (var i = 0; i < oldDateEnding[0].length; i++) {
                let oldDateEnding = await con2.execute(`SELECT date_ending FROM slowmode wHERE message_id = '${messageID}'`);
                let checkOldslowmode = await con2.execute(`SELECT slowmode FROM reactionrole wHERE message_id = '${messageID}'`);
                let oldslowmode = parseInt(checkOldslowmode[0][i].slowmode)
                if (newslowmode > oldslowmode) {
                    var newDateEnding = parseInt(oldDateEnding[0][i].date_ending) + newslowmode * 60000 - oldslowmode * 60000
                } else {
                    var newDateEnding = parseInt(oldDateEnding[0][i].date_ending) - newslowmode * 60000 - oldslowmode * 60000
                }
                await con2.execute(`UPDATE slowmode SET date_ending = "${newDateEnding}" WHERE message_id = '${messageID}';`);
                await con2.execute(`UPDATE slowmode SET slowmode = "${newslowmode}" WHERE message_id = '${messageID}';`);
            }

            await con2.execute(`UPDATE reactionrole SET slowmode = "${newslowmode}" WHERE message_id = '${messageID}'`);
            interaction.editReply({
                content: `**Role Menu menu has been sucessfuly edited**!\nChanges:\nNew slowmode: **${newslowmode}**\n\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }
    },
}