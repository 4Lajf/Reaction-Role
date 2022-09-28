const Spotify = require('node-spotify-api');
var { getData, getPreview } = require("spotify-url-info");
const usetube = require('usetube')
const config = require("./config.json");
module.exports = (client, instance, channel) => {
    client.on("messageCreate", async function (message) {
        const msgContent = message.content
        const serverid = message.guild.id
        const msgID = message.id
        if (/^(spotify:|https:\/\/[a-z]+\.spotify\.com\/)/gm.test(msgContent)) {
            const mysql2 = require('mysql2/promise');
            const con2 = await mysql2.createConnection({
         host: "127.0.0.1",
                user: config.reactionrole_username,
                password: config.reactionrole_password,
                port: "3306",
                database: config.reactionrole_database,
                charset: 'utf8mb4'
            });

            async function ifCommandDisabled() {

                // query database
                let query = await con2.execute(`SELECT EXISTS (SELECT read_values FROM toggle WHERE server_id = '${serverid}' AND command = 'togglespotify') AS result;`);
                query = query[0][0].result
                if (query == 0) {
                    return 1;
                } else {
                    let query = await con2.execute(`SELECT read_values FROM toggle WHERE server_id = '${serverid}' AND command = 'togglespotify'`);
                    query = query[0][0].read_values
                    return query;
                }
            }
            let boolifCommandDisabled = await ifCommandDisabled()
            if (boolifCommandDisabled == 0) {
                let spotifyData = await getPreview(msgContent);
                let spotifySong = `song ${spotifyData.title} by ${spotifyData.artist}`
                //console.log(spotifySong)
                let video = await usetube.searchVideo(spotifySong)
                //console.log(video)
                let id = `https://www.youtube.com/watch?v=${video.videos[0].id}`
                message.reply({ content: id, allowedMentions: { repliedUser: false } }).then(msg => {
                    msg.react('❌').catch(error => {
                        message.channel.send({
                            content: `:x: I don't have permission to react to that message`, ephemeral: true, allowedMentions: { parse: [] }
                        })
                        return;
                    });
                    const filter = (reaction, user) => {
                        return reaction.emoji.name === '❌';
                    };

                    const collector = msg.createReactionCollector({ filter, time: 1000 * 300 });

                    collector.on('collect', (reaction, user) => {
                        if (user.id === message.author.id) {
                            msg.delete().catch(error => {
                                message.channel.send({
                                    content: `:x: I don't have permission to delete messages`, ephemeral: true, allowedMentions: { parse: [] }
                                })
                                return;
                            });
                        }
                    });

                    collector.on('end', collected => {
                        return
                    });

                })
            } else {
                return false;
            }
        } else {
            return false;
        }
    });

    // Configuration for this feature
    module.exports.config = {
        // The display name that server owners will see.
        // This can be changed at any time.
        displayName: 'Spotify to YouTube',

        // The name the database will use to set if it is enabled or not.
        // This should NEVER be changed once set, and users cannot see it.
        dbName: 'SPOTIFY_TO_YT'
    }
}