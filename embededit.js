const { Permissions } = require('discord.js');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
const fs = require("fs");
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Edit your custom embed message', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'message_link', // Must be lower case
            description: 'Message link to an existing embed',
            required: true,
            type: 3, // This argument is a string
        },
    ],
    callback: async ({ interaction, client }) => {
        let channel = interaction.channel
        let member = interaction.member
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let serverid = interaction.guild.id
        let guild = interaction.guild
        const errorChannel = client.channels.cache.get('581959517345021963')

        const fuckup = fs.createWriteStream('unexpectederrors.txt', { flags: 'a', encoding: 'utf8' });
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }

        const commandChannel = client.channels.cache.get('923378105454841856')
        commandChannel.send({
            content: `${getDate()} COMMAND \`/embededit\` WAS EXECUTED BY ${interaction.user.username}`
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'embededit') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'embededit'`);
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

        var messageLink = interaction.options._hoistedOptions[0].value
        const messageID = messageLink.match(/.{18}$/g)
        const message = await interaction.channel.messages.fetch(messageID[0])

        //checks if message link is valid
        if (!message && message.author.id == "859363046185893890") {
            interaction.reply({
                content: `:x: Invalid message link`, ephemeral: true, allowedMentions: { repliedUser: false }
            })
            return false;
        }


        // Executing
        const embed = new MessageEmbed()
            .setDescription(`Please Enter your Embed Title`)
            .setFooter(`To cancel, please reply with "cancel"\nYou have 30 seconds to send your Embed Title`)
            .setColor('BLUE');
        var filter = m => m.author.id == interaction.member.id
        interaction.reply({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(channel.awaitMessages({ filter, max: 1, time: 30_000, errors: [] }).then(collected => {
            if (typeof collected.first() === "undefined") {
                const embed = new MessageEmbed()
                    .setDescription('Timeout! Please try again later')
                    .setColor('c11515');
                interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
            } else {
                if (collected.first().content.toLowerCase() == 'cancel') {
                    const embed = new MessageEmbed()
                        .setDescription(`Operation Cancelled by User`)
                        .setColor('c11515');
                    interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                } else {
                    const title = collected.first().content;
                    const embed = new MessageEmbed()
                        .setDescription(`Please Enter the Embed Color Hex Code Without "#"`)
                        .setFooter(`To cancel, please reply with "cancel"\nYou have 30 seconds to send your Embed Color Hex Code`)
                        .setColor('BLUE');
                    interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(channel.awaitMessages({ filter, max: 1, time: 30_000, errors: [] }).then(collected2 => {
                        if (typeof collected2.first() === "undefined") {
                            const embed = new MessageEmbed()
                                .setDescription('Timeout! Please try again later')
                                .setColor('c11515');
                            interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                        } else {
                            if (collected2.first().content.toLowerCase() == 'cancel') {
                                const embed = new MessageEmbed()
                                    .setDescription(`Operation Cancelled by User`)
                                    .setColor('c11515');
                                interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                            } else {
                                function is_hexadecimal(str) {
                                    regexp = /^[0-9a-fA-F]+$/;

                                    if (regexp.test(str)) {
                                        return true;
                                    }
                                    else {
                                        return false;
                                    }
                                }
                                let isHex = is_hexadecimal(collected2.first().content)
                                if (isHex == false) {
                                    interaction.followUp({
                                        content: `:x: Invalid Hex Code!`, ephemeral: true, allowedMentions: { parse: [] }
                                    })
                                    return;
                                }
                                const color = collected2.first().content;
                                const embed = new MessageEmbed()
                                    .setDescription(`Please send your Embed description`)
                                    .setFooter(`To cancel, please reply with "cancel"\nYou have 180 seconds to send your Embed Description`)
                                    .setColor('BLUE');
                                interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(channel.awaitMessages({ filter, max: 1, time: 30_000, errors: [] }).then(collected4 => {
                                    if (typeof collected4.first() === "undefined") {
                                        const embed = new MessageEmbed()
                                            .setDescription('Timeout! Please try again later')
                                            .setColor('c11515');
                                        interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                                    } else {
                                        if (collected4.first().content.toLowerCase() == 'cancel') {
                                            const embed = new MessageEmbed()
                                                .setDescription(`Operation Cancelled by User`)
                                                .setColor('c11515');
                                            interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                                        } else {
                                            const desc = collected4.first().content;
                                            const embed = new MessageEmbed()
                                                .setDescription(`Please send your mention a channel to send`)
                                                .setFooter(`To cancel, please reply with "cancel"\nYou have 180 seconds to send the Channel ID that the embed will be sent to`)
                                                .setColor('BLUE');
                                            interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(channel.awaitMessages({ filter, max: 1, time: 30_000, errors: [] }).then(collected6 => {
                                                if (typeof collected6.first() === "undefined") {
                                                    const embed = new MessageEmbed()
                                                        .setDescription('Timeout! Please try again later')
                                                        .setColor('c11515');
                                                    interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                                                } else {
                                                    if (collected6.first().content.toLowerCase() == 'cancel') {
                                                        const embed = new MessageEmbed()
                                                            .setDescription(`Operation Cancelled by User`)
                                                            .setColor('c11515');
                                                        interaction.followUp({ embeds: [embed], fetchReply: true, allowedMentions: { parse: [] } }).then(msg => { msg.delete({ timeout: 7000 }) });
                                                    } else {
                                                        if (collected6.first().content.includes('<#')) {
                                                            const check = collected6.first().content.replace(/[^A-Z0-9]+/ig, "")
                                                            if (guild.channels.cache.get(check)) {
                                                                const ch = guild.channels.cache.get(check)
                                                                const embed = new MessageEmbed()
                                                                    .setTitle(title)
                                                                    .setColor(color)
                                                                    .setDescription(desc)
                                                                message.edit({ embeds: [embed], allowedMentions: { parse: [] } }).catch((err) => {
                                                                    return interaction.followUp({
                                                                        content: `Unkown Error Occured. Please Check If I have permission to send in the mentioned channel`, ephemeral: true, allowedMentions: { parse: [] }
                                                                    })
                                                                })
                                                                interaction.followUp({
                                                                    content: `Embed Has successfully edited!`, ephemeral: true, allowedMentions: { parse: [] }
                                                                })
                                                                return;
                                                            } else {
                                                                interaction.followUp({
                                                                    content: `This channel does not exits on this server.`, ephemeral: true, allowedMentions: { parse: [] }
                                                                })
                                                            }
                                                        } else {
                                                            const check = guild.channels.cache.get(collected6.first().content)

                                                            if (check) {
                                                                const ch = check
                                                                const embed = new MessageEmbed()
                                                                    .setTitle(title)
                                                                    .setColor(color)
                                                                    .setDescription(desc)
                                                                message.edit({ embeds: [embed], allowedMentions: { parse: [] } }).catch((err) => {
                                                                    return interaction.followUp({
                                                                        content: `Unkown Error Occured. Please Check If I have permission to send in the mentioned channel`, ephemeral: true, allowedMentions: { parse: [] }
                                                                    })
                                                                })
                                                                interaction.followUp({
                                                                    content: `Embed Has successfully edited!`, ephemeral: true, allowedMentions: { parse: [] }
                                                                })
                                                                return;
                                                            } else {
                                                                interaction.followUp({
                                                                    content: `This channel does not exits on this server.`, ephemeral: true, allowedMentions: { parse: [] }
                                                                })
                                                            }
                                                        }
                                                    }
                                                }
                                            })).catch((err) => {
                                                console.log(`${getDate()} [ERROR:embededit.js] ${error}`);
                                                fuckup.write(`${getDate()} [ERROR:embededit.js] ${error}`)
                                                errorChannel.send({
                                                    content: `${getDate()} [ERROR:embededit.js] ${error}`
                                                })
                                                interaction.channel.send({
                                                    content: `Something went wrong while creating the embed. Contact your guild admin with this info \`\`\`${error}\`\`\`The developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                                                });
                                            });
                                        }
                                    }
                                })).catch((err) => {
                                    console.log(`${getDate()} [ERROR:embededit.js] ${error}`);
                                    fuckup.write(`${getDate()} [ERROR:embededit.js] ${error}`)
                                    errorChannel.send({
                                        content: `${getDate()} [ERROR:embededit.js] ${error}`
                                    })
                                    interaction.channel.send({
                                        content: `Something went wrong while creating the embed. Contact your guild admin with this info \`\`\`${error}\`\`\`The developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                                    });
                                });
                            }
                        }
                    })).catch((err) => {
                        console.log(`${getDate()} [ERROR:embededit.js] ${error}`);
                        fuckup.write(`${getDate()} [ERROR:embededit.js] ${error}`)
                        errorChannel.send({
                            content: `${getDate()} [ERROR:embededit.js] ${error}`
                        })
                        interaction.channel.send({
                            content: `Something went wrong while creating the embed. Contact your guild admin with this info \`\`\`${error}\`\`\`The developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
                        });
                    });
                }
            }
        })).catch((err) => {
            console.log(`${getDate()} [ERROR:embed.js] ${error}`);
            fuckup.write(`${getDate()} [ERROR:embed.js] ${error}`)
            errorChannel.send({
                content: `${getDate()} [ERROR:embededit.js] ${error}`
            })
            interaction.channel.send({
                content: `Something went wrong while creating the embed. Try again\nThe developer has been automatically notifed of this.`, ephemeral: true, allowedMentions: { parse: [] }
            });
        });

    },
}