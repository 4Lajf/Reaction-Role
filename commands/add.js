const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const fs = require("fs");
module.exports = {
    description: 'Add customizable Role Menu to an existing message', // Required for slash commands
    category: 'All',
    guildOnly: true,
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'message_link', // Must be lower case
            description: 'Link to the message on which you want to create Role Menu',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'emojis', // Must be lower case
            description: 'SEPARATE BY COMMA `,` | Reaction that you want to add',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'roles', // Must be lower case
            description: '@MENTION SEPARATE BY COMMA `,` | Role that will be given if someone clicks on the reaction',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'max', // Must be lower case
            description: 'How many roles can a user give to themselves from the Role Menu. 0 - infinite',
            type: 4, // This argument is an int
        },
        {
            name: 'duration', // Must be lower case
            description: 'After what time (in minutes) the role will be revoked. 0 - doesn\'t expire',
            type: 4, // This argument is an int
        },
        {
            name: 'slowmode', // Must be lower case
            description: 'How fast can user interact with Role Menu in minutes. 0 - no limit',
            type: 4, // This argument is an int
        },
        {
            name: 'whitelisted_roles', // Must be lower case
            description: 'What roles should be allowed to use this Role Menu. "none" for @everyone',
            type: 3, // This argument is a string
        },
        {
            name: 'blacklisted_roles', // Must be lower case
            description: 'What roles should be banned from using this Role Menu. "none" for @everyone',
            type: 3, // This argument is a string
        },
    ],




    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        /* ############################################################## *
        * ------------------- RETREIVE ARGUMENTS DATA ------------------- *
        *  ############################################################## */
        var messageLinkArg = interaction.options.get('message_link')
        messageLinkArg = messageLinkArg ? interaction.options.get('message_link').value : null;
        var emojiArg = interaction.options.get('emojis')
        emojiArg = emojiArg ? interaction.options.get('emojis').value : null;
        var roleArg = interaction.options.get('roles')
        roleArg = roleArg ? interaction.options.get('roles').value : null;
        var maxArg = interaction.options.get('max')
        maxArg = maxArg ? interaction.options.get('max').value : 0;
        var durationArg = interaction.options.get('duration')
        durationArg = durationArg ? interaction.options.get('duration').value : 0;
        var slowmodeArg = interaction.options.get('slowmode')
        slowmodeArg = slowmodeArg ? interaction.options.get('slowmode').value : 0;
        var whiteListedRoleArg = interaction.options.get('whitelisted_roles')
        whiteListedRoleArg = whiteListedRoleArg ? interaction.options.get('whitelisted_roles').value : "none";
        var blackListedRoleArg = interaction.options.get('blacklisted_roles')
        blackListedRoleArg = blackListedRoleArg ? interaction.options.get('blacklisted_roles').value : "none";
        const fuckup = fs.createWriteStream('unexpectederrors.txt', { flags: 'a', encoding: 'utf8' }); const logChannel = client.channels.cache.get('606224251443478530')
        const commandChannel = client.channels.cache.get('923378105454841856')
        commandChannel.send({
            content: `${getDate()} COMMAND \`/add\` WAS EXECUTED BY \`${interaction.user.username}\`\nMESSAGE_LINK: \`${messageLinkArg}\`\nEMOJI: ${emojiArg}\nROLE: \\${roleArg}\nMAX: \`${maxArg}\`\nSLOWMODE: \`${slowmodeArg}\`\nWHITE_LIST: \\${whiteListedRoleArg}\nBLACK_LIST: \\${blackListedRoleArg}
            \`\`\`ini
            [END OF THE LINE]
            \`\`\``
        })

        /* ############################################################## *
        * ------------------------- BASE COMMAND ------------------------ *
        *  ############################################################## */

        //Prepare bot client, the member that called the command and the channel that command was called in
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let serverid = interaction.guild.id
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'add') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'add'`);
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

        // Check if message link is valid
        try {
            var messageLink = messageLinkArg
            var messageRegex = messageLink.match(/[0-9]{2}([0-9]{5})[0-9]+/g)
            var channelID = messageRegex[1].toString()
            var messageID = messageRegex[2].toString()
            var channel = await interaction.guild.channels.fetch(channelID)
            var message = await channel.messages.fetch(messageID)
            //checks if message link is valid
            if (!message) {
                interaction.editReply({
                    content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { repliedUser: false }
                })
                return;
            }
        } catch {
            interaction.editReply({
                content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return;
        }


        // Get the array of emoji and roles and remove white spaces
        let emojiArr = emojiArg.split(",")
        let roleArr = roleArg.split(",")

        if (emojiArr.length !== roleArr.length) {
            interaction.editReply({
                content: `:x: Role and emoji count mismatch.`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }
        if (emojiArr.length > 19) {
            interaction.editReply({
                content: `:x: Discord allows max 20 reactions per message`, ephemeral: true, allowedMentions: { parse: [] }
            })
            return false;
        }
        let checkRoleArr = []
        let checkEmojiArr = []
        for (var i = 0; i < emojiArr.length; i++) {
            emojiArr[i] = emojiArr[i].replace(/ /g, '')
            roleArr[i] = roleArr[i].replace(/ /g, '')
            await validateEmojis(emojiArr[i])
            await validateRoles(roleArr[i])
            if (checkEmojiArr.includes(false) === true || checkRoleArr.includes(false) === true) {
                break;
            }
        }
        let boolValidateEmojis = checkRoleArr.every(checkList);
        let boolValidateRoles = checkEmojiArr.every(checkList);

        //If a role is required for the reaction menu validate it
        if (whiteListedRoleArg && whiteListedRoleArg != "none") {
            var verifyWLarr = whiteListedRoleArg.split(",")
            checkRoleArr = []
            for (var i = 0; i < verifyWLarr.length; i++) {
                verifyWLarr[i] = verifyWLarr[i].replace(/ /g, '')
                await validateRoles(verifyWLarr[i])
            }
            var boolValidateWLVerify = checkRoleArr.every(checkList);
        } else {
            var boolValidateWLVerify = true;
        }
        if (blackListedRoleArg && blackListedRoleArg != "none") {
            var verifyBLarr = blackListedRoleArg.split(",")
            checkRoleArr = []
            for (var i = 0; i < verifyBLarr.length; i++) {
                verifyBLarr[i] = verifyBLarr[i].replace(/ /g, '')
                await validateRoles(verifyBLarr[i])
            }
            var boolValidateBLVerify = checkRoleArr.some(checkList);
        } else {
            var boolValidateBLVerify = true;
        }
        function checkList(has_role) {
            return has_role == true
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
                        content: `:x: At least one of provided emojis doesen't exists`, ephemeral: true, allowedMentions: { parse: [] }
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

        let checkDuplicate = [];
        async function isDuplicate(role, emoji) {
            var roleID = role.match(/(\d)+/g).toString();
            var messageID = messageLinkArg.match(/.{18}$/g).toString()
            let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM reactionrole WHERE message_id = '${messageID}' AND role_id = '${roleID}') AS result;`);
            query = query[0][0].result
            if (query == 1) {
                checkDuplicate.push(true)
                interaction.editReply({
                    content: `:x: At least one provided emojis already exist! Use \`/edit\` to edit it or \`/delete\` to delete it!`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return true;
            } else {
                checkDuplicate.push(false)
                return false;
            }
        }
        if (!(checkEmojiArr.includes(false) === true || checkRoleArr.includes(false) === true)) {
            for (var i = 0; i < roleArr.length; i++) {
                await isDuplicate(roleArr[i], emojiArr[i])
                if (checkDuplicate.includes(true) === true) {
                    var boolIsDuplicate = true;
                    break;
                } else {
                    var boolIsDuplicate = false;
                }
            }
        }


        /* ############################################################## *
        *  ---------------------- COMMAND FUNCTIONS --------------------- *
        *  ############################################################## */
        //if validate is true create execute command code
        if (boolValidateEmojis === false || boolValidateRoles === false || boolValidateBLVerify === false || boolValidateWLVerify === false || boolIsDuplicate === true) {
            return;
        }

        createMessageRoleMenu(emojiArr, roleArr);

        async function createMessageRoleMenu(emojiArr, roleArr) {

            //Check if reaction exists

            for (var i = 0; i < emojiArr.length; i++) {
                var roleID = roleArr[i].match(/(\d)+/g).toString()
                var fetchRole = await interaction.guild.roles.fetch(roleID)
                var fetchMessage = await channel.messages.fetch(messageID)

                //log it to the database
                var emojiID = emojiArr[i]
                await con2.execute(`INSERT INTO reactionrole (message_id, role_id, emoji, max, duration, slowmode) VALUES ('${messageID}', '${roleID}', '${emojiID}', ${maxArg}, ${durationArg}, ${slowmodeArg});`);
                const addedLog = fs.createWriteStream('dbadds.txt', { flags: 'a', encoding: 'utf8' });
                addedLog.write(`${getDate()} [DB ADD] - ROLE \`${fetchRole.name}\`[${roleID}] SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
                logChannel.send({
                    content: `${getDate()} [DB ADD] - ROLE \`${fetchRole.name}\`[${roleID}] SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``
                })
                console.log(`${getDate()} [DB ADD] - ROLE \`${fetchRole.name}\`[${roleID}] SERVER \`${interaction.guild.name}\`[${interaction.guild.id}]MESSAGE ID [${messageID}] Content:\n\`\`\`${fetchMessage.content}\`\`\``)
                await con2.execute(`UPDATE reactionrole SET max = "${maxArg}", duration = "${durationArg}", slowmode = "${slowmodeArg}" WHERE message_id = "${messageID}";`);

                await con2.execute(`UPDATE whitelist SET role_id = "${whiteListedRoleArg}" WHERE message_id = "${messageID}";`);

                if (/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g.test(emojiArr[i])) {
                    var id = emojiArr[i]
                    await message.react(id).catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to react to that message`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                } else {
                    let id = emojiArr[i].match(/(\d)+.$/g)
                    id = id[0].slice(0, -1)
                    await message.react(id).catch(error => {
                        interaction.editReply({
                            content: `:x: I don't have permission to react to that message`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                }
            }



            if (whiteListedRoleArg && whiteListedRoleArg != "none") {
                for (var i = 0; i < verifyWLarr.length; i++) {
                    var verifyWLID = verifyWLarr[i].match(/(\d)+/g)
                    let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM whitelist WHERE message_id = '${messageID}') AS result;`);
                    query = query[0][0].result
                    if (query == 0) {
                        await con2.execute(`INSERT INTO whitelist (message_id, role_id) VALUES ('${messageID}', '${verifyWLID}');`);
                    } else {
                        await con2.execute(`UPDATE whitelist SET role_id = "${verifyWLID}" WHERE message_id = "${messageID}";`);
                    }
                }
            }

            if (blackListedRoleArg && blackListedRoleArg != "none") {
                for (var i = 0; i < verifyBLarr.length; i++) {
                    var verifyBLID = verifyBLarr[i].match(/(\d)+/g)
                    let query = await con2.execute(`SELECT EXISTS (SELECT message_id FROM blacklist WHERE message_id = '${messageID}') AS result;`);
                    query = query[0][0].result
                    if (query == 0) {
                        await con2.execute(`INSERT INTO blacklist (message_id, role_id) VALUES ('${messageID}', '${verifyWLID}');`);
                    } else {
                        await con2.execute(`UPDATE blacklist SET role_id = "${verifyBLID}" WHERE message_id = "${messageID}";`);
                    }
                }
            }

            interaction.editReply({
                content: `**Role Menu has been sucessfuly added!**\n *P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, ephemeral: true, allowedMentions: { parse: [] }
            })
        }
    },
}