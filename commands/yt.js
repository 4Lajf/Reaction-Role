const { Permissions } = require('discord.js');
var { getData, getPreview } = require("spotify-url-info");
const config = require("./config.json");
const usetube = require('usetube')
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Search for a video on YouTube. You can also paste a Spotify link.', // Required for slash commands
    slash: true,
    testOnly: true,
    options: [
        {
            name: 'keywords', // Must be lower case
            description: 'What do you want to search?',
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

        //Prepare bot client, the member that called the command and the channel that command was called in
        let botMember = interaction.guild.members.cache.get("579036883674333185");
        let member = interaction.member
        let channel = interaction.channel
        let serverid = interaction.guild.id
        var keywords = interaction.options.get('keywords')?.value;
        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/yt\` WAS EXECUTED BY ${interaction.user.username} CONTENT: \`${keywords}\``
        })


        //Execute only if bot client have permissions

        if (botMember.permissions.has([Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.MANAGE_ROLES, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.SEND_MESSAGES]) === false) {
            //No send messages permission
            interaction.reply({
                content: `:x: **I need the following permissions to be able to opreate**
\`MANAGE MESSAGES\` - To remove message once :x: is clicked
\`ADD REACTIONS\` - To add reactions`, ephemeral: true, allowedMentions: { parse: [] }
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'yt') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'yt'`);
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

        if (/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/gm.test(keywords)) {
            await interaction.deferReply();
            let spotifyData = await getPreview(keywords);
            let spotifySong = `song ${spotifyData.title} by ${spotifyData.artist}`
            //console.log(spotifySong)
            let video = await usetube.searchVideo(spotifySong)
            //console.log(video)
            var id = `https://www.youtube.com/watch?v=${video.videos[0].id}`

            const msg = await interaction.editReply({ content: id, fetchReply: true, allowedMentions: { repliedUser: false } }).then(msg => {
                msg.react('❌').catch(error => {
                    interaction.followUp({
                        content: `:x: I don't have permission to react to that message\n ${error}`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    return;
                });
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '❌';
                };

                const collector = msg.createReactionCollector({ filter, time: 1000 * 300 });

                collector.on('collect', (reaction, user) => {
                    if (user.id === interaction.member.id)
                        msg.delete().catch(error => {
                            interaction.followUp({
                                content: `:x: I don't have permission to delete messages\n${error}`, ephemeral: true, allowedMentions: { parse: [] }
                            })
                            return;
                        });;
                });

                collector.on('end', collected => {
                    return
                });
            })
        } else {
            let video = await usetube.searchVideo(keywords)
            var id = `https://www.youtube.com/watch?v=${video.videos[0].id}`

            const msg = await interaction.reply({ content: id, fetchReply: true, allowedMentions: { repliedUser: false } }).then(msg => {
                msg.react('❌').catch(error => {
                    interaction.followUp({
                        content: `:x: I don't have permission to react to that message\n ${error}`, ephemeral: true, allowedMentions: { parse: [] }
                    })
                    return;
                });
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '❌';
                };

                const collector = msg.createReactionCollector({ filter, time: 1000 * 300 });

                collector.on('collect', (reaction, user) => {
                    if (user.id === interaction.member.id)
                        msg.delete().catch(error => {
                            interaction.followUp({
                                content: `:x: I don't have permission to delete messages\n${error}`, ephemeral: true, allowedMentions: { parse: [] }
                            })
                            return;
                        });;
                });

                collector.on('end', collected => {
                    return
                });
            })
        }
    },
}