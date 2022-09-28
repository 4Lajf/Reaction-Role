const { Permissions } = require('discord.js');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Show bot uptime', // Required for slash commands
    slash: true,
    testOnly: false,
    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        let member = interaction.member
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let serverid = interaction.guild.id

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

        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/uptime\` WAS EXECUTED BY ${interaction.user.username}`
        })


        async function getPermitedRoles() {
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'uptime') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'uptime'`);
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
        const moment = require("moment");
        require("moment-duration-format");
        const uptime = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
        interaction.reply({
            content: `Time since the last restart: ${uptime}`, ephemeral: true, allowedMentions: { parse: [] }
        })

    },
}