const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Learn more about us!', // Required for slash commands
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
        let channel = interaction.channel
        let serverid = interaction.guild.id
        const commandChannel = client.channels.cache.get('923378105454841856')
        commandChannel.send({
            content: `${getDate()} COMMAND \`/about\` WAS EXECUTED BY ${interaction.user.username}`
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'about') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'about'`);
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

        const aboutEmbed = new MessageEmbed()
            .setColor("YELLOW")
            .setTitle(`**Made with :heart: by 4Lajf#7187**`)
            .setDescription(`Currently I'm a single developer that aims to provide amazing and **always free** solutions for whoever may need them.\n I hope you'll enjoy our premium features that should be free from the start!\n **Check us out on our:**`)
            .addFields(
                { name: 'Website', value: `https://docs.4lajf.com\n*Real website soon!*`, inline: true },
                { name: 'Twitter', value: `https://twitter.com/_HeartBeatDev`, inline: true },
                { name: 'Support Server', value: `https://discord.gg/kPKrgNd9wK`, inline: true },
                { name: 'Vote For Us', value: `https://top.gg/bot/859363046185893890/vote`, inline: true },
                { name: 'Invite Link', value: `https://discord.com/api/oauth2/authorize?client_id=859363046185893890&permissions=277294181568&scope=applications.commands%20bot`, inline: false },
            )
            .setFooter(`Heartbeat Development\nMade to impress. Designed to stay free.`);
        interaction.reply({ embeds: [aboutEmbed], allowedMentions: { parse: [] } })
    },
}