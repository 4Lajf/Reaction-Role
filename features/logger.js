const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
module.exports = (client, instance, channel) => {
    client.on("guildMemberUpdate", async function (oldMember, newMember) {
        let serverid = oldMember.guild.id
        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        const errorChannel = client.channels.cache.get('581959517345021963')
        async function isLoggingEnabled() {
            // query database
            let check = await con2.execute(`SELECT EXISTS (SELECT channel_id FROM logchannel WHERE server_id = '${serverid}') AS result;`);
            check = JSON.stringify(check[0]).match(/(\d)+/g)
            return check;
        }

        let boolisLoggingEnabled = await isLoggingEnabled()
        if (boolisLoggingEnabled[0] == 1) {
            let channelid = await con2.execute(`SELECT channel_id FROM logchannel WHERE server_id = '${serverid}'`);
            channelid = JSON.stringify(channelid[0]).match(/(\d)+/g)

            const fetchedLogs = await oldMember.guild.fetchAuditLogs({
                limit: 1,
            });

            // Since there's only 1 audit log entry in this collection, grab the first one
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            const roleLog = fetchedLogs.entries.first();
            let state = roleLog.changes[0].key
            let roleName = roleLog.changes[0].new[0].name
            let roleID = roleLog.changes[0].new[0].id
            let owner = await guild.fetchOwner()
            
            if (state == "$remove") {
                let roleAdded = oldMember.guild.channels.cache.get(channelid[0])
                // Perform a coherence check to make sure that there's *something*
                if (!roleLog) return roleAdded.send({ content: `:exclamation: **\`${oldMember.tag}\` I don't know how he was removed from this role.**`, allowedMentions: { parse: [] } });

                // Now grab the user object of the person who kicked the member
                // Also grab the target of this action to double-check things
                const { executor, target } = roleLog;

                // Update the output with a bit more information
                // Also run a check to make sure that the log returned was for the same kicked member
                if (target.id === oldMember.id) {

                    const roleRemoveEmbed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Role Removed')
                        .addFields(
                            { name: 'Role', value: `\`${roleName}\` [<@&${roleID}>] `, inline: true },
                            { name: 'Executor', value: `\`${executor.tag}\` [<@${executor.id}>]`, inline: true },
                            { name: 'Target', value: `\`${target.tag}\` [<@${target.id}>]`, inline: true },
                        )
                        .setTimestamp()
                    roleAdded.send({ embeds: [roleRemoveEmbed], allowedMentions: { parse: [] } }).catch((err) => {
                        console.log(`[ERROR:logger.js:62] ${error}`);
                        fuckup.write(`[ERROR:logger.js:62] ${error}\n`)
                        errorChannel.send({
                            content: `[ERROR:logger.js:62] ${error}`
                        })
                        owner.send({
                            content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                        });
                    });
                } else {
                    roleAdded.send({ content: `:exclamation: \`${executor.tag}\` **removed role from we don't know who because audit log is inconclusive.**`, allowedMentions: { parse: [] } }).catch((err) => {
                        console.log(`[ERROR:logger.js:70] ${error}`);
                        fuckup.write(`[ERROR:logger.js:70] ${error}\n`)
                        errorChannel.send({
                            content: `[ERROR:logger.js:70] ${error}`
                        })
                        owner.send({
                            content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                        });
                    });
                }
            } else if (state == "$add") {
                let roleAdded = oldMember.guild.channels.cache.get(channelid[0])
                // Perform a coherence check to make sure that there's *something*
                if (!roleLog) return  roleAdded.send({ content: `:exclamation: \`${oldMember.tag}\` **we don't know how he was added to the role.**`, allowedMentions: { parse: [] } }).catch((err) => {
                    console.log(`${getDate()}[ERROR:logger.js:81] ${error}`);
                    fuckup.write(`${getDate()}[ERROR:logger.js:81] ${error}\n`)
                    errorChannel.send({
                        content: `${getDate()}[ERROR:logger.js:81] ${error}`
                    })
                    owner.send({
                        content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                    });
                });
               

                // Now grab the user object of the person who kicked the member
                // Also grab the target of this action to double-check things
                const { executor, target } = roleLog;

                // Update the output with a bit more information
                // Also run a check to make sure that the log returned was for the same kicked member
                if (target.id === oldMember.id) {

                    const roleAddedEmbed = new MessageEmbed()
                        .setColor('GREEN')
                        .setTitle('Role Added')
                        .addFields(
                            { name: 'Role', value: `\`${roleName}\` [<@&${roleID}>] `, inline: true },
                            { name: 'Executor', value: `\`${executor.tag}\` [<@${executor.id}>]`, inline: true },
                            { name: 'Target', value: `\`${target.tag}\` [<@${target.id}>]`, inline: true },
                        )
                        .setTimestamp()
                    roleAdded.send({ embeds: [roleAddedEmbed], allowedMentions: { parse: [] } }).catch((err) => {
                        console.log(`${getDate()}[ERROR:logger.js:107] ${error}`);
                        fuckup.write(`${getDate()}[ERROR:logger.js:107] ${error}\n`)
                        errorChannel.send({
                            content: `${getDate()}[ERROR:logger.js:107] ${error}\n`
                        })
                        owner.send({
                            content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                        });
                    });
                } else {
                    roleAdded.send({ content: `:exclamation: \`${executor.tag}\` **added role to we don't know who because audit log is inconclusive**`, allowedMentions: { parse: [] } }).catch((err) => {
                        console.log(`${getDate()}[ERROR:logger.js:115] ${error}`);
                        fuckup.write(`${getDate()}[ERROR:logger.js:116] ${error}\n`)
                        errorChannel.send({
                            content: `${getDate()}[ERROR:logger.js:115] ${error}`
                        })
                        owner.send({
                            content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                        });
                    });
                }
            } else {
                roleAdded.send({ content: `:exclamation: Unexpected error happened while trying to fetch state of updated role. This has been reported automaticly to the developers.**`, allowedMentions: { parse: [] } }).catch((err) => {
                    console.log(`[ERROR:logger.js:124] ${error}`);
                    fuckup.write(`[ERROR:logger.js:124] ${error}\n`)
                    errorChannel.send({
                        content: `[ERROR:logger.js:124] ${error}`
                    })
                    owner.send({
                        content: `Something went wrong while sending message to log channel. Try checking the channel's permissions. \nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                    });
                });
                fuckup.write(`${getDate()}Unexpected error happened while trying to fetch state of updated role (neither "$remove" nor "$add")\n`)
                console.log(`${getDate()}Unexpected error happened while trying to fetch state of updated role (neither "$remove" nor "$add")`)
                errorChannel.send({
                    content: `${getDate()}Unexpected error happened while trying to fetch state of updated role (neither "$remove" nor "$add")`
                })
            }
        } else {
            return;
        }
    });

    // Configuration for this feature
    module.exports.config = {
        // The display name that server owners will see.
        // This can be changed at any time.
        displayName: 'Logger',

        // The name the database will use to set if it is enabled or not.
        // This should NEVER be changed once set, and users cannot see it.
        dbName: 'LOGGER'
    }
}