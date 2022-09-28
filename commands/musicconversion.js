const { Permissions } = require('discord.js');
const config = require("./config.json");
const usetube = require('usetube')
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Toggle automatic Spotify to YT link conversion', // Required for slash commands
    slash: true,
    testOnly: false,
    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        //Prepare bot client, the member that called the command and the channel that command was called in
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let serverid = interaction.guild.id
        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/musicconversion\` WAS EXECUTED BY ${interaction.user.username}`
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'musicconversion') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'musicconversion'`);
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

        async function checkIfCommandEntryExists() {
            // query database
            let query = await con2.execute(`SELECT EXISTS (SELECT server_id, command FROM toggle WHERE server_id = '${serverid}' AND command = 'togglespotify') AS result;`);
            query = query[0][0].result
            return query;
        }

        let boolIfCommandEntryExits = await checkIfCommandEntryExists()
        console.log(boolIfCommandEntryExits)
        if (boolIfCommandEntryExits == 0) {
            await con2.execute(`INSERT INTO toggle (server_id, command, read_values) VALUES (${serverid}, 'togglespotify', '0')`);
            interaction.reply({
                content: `Spotify link conversion has been **enabled**. You can now send a Spotify link in chat and it will be automatically resolved into a YouTube link. \n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, allowedMentions: { repliedUser: false }
            })
            return;
        } else {
            await con2.execute(`DELETE FROM toggle WHERE server_id = "${serverid}" AND command = 'togglespotify'`);
            interaction.reply({
                content: `Spotify link conversion has been **disabled**\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, allowedMentions: { repliedUser: false }
            })
            return;

        }
    },
}