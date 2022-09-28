const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("./config.json");
const { MessageEmbed } = require('discord.js');
module.exports = {
    category: 'All',
    guildwOnly: true,
    description: 'Give us some feedback!', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'feedback', // Must be lower case
            description: 'Give us some feedback!',
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
        var feedbacktxt = interaction.options.get('feedback').value
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let channel = interaction.channel
        let serverid = interaction.guild.id


        const commandChannel = client.channels.cache.get('923378105454841856')
        commandChannel.send({
            content: `${getDate()} COMMAND \`/feedback\` WAS EXECUTED BY ${interaction.user.username}\nCONTENT: \`\`\`${feedbacktxt}\`\`\``
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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'feedback') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'feedback'`);
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

        const feedbackEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle(`**Feedback has been received!**`)
            .addFields(
                { name: 'User', value: `${member.user.tag} [${member.id}]`, inline: true },
                { name: 'Feedback', value: feedbacktxt, inline: false },
                { name: 'Admin reply', value: `Pending...`, inline: false },
            )
            .setTimestamp()
            .setFooter(`${member.user.tag}`, `${member.user.avatarURL({ dynamic: true, format: 'png', size: 128 })}`);
        const fuckup = fs.createWriteStream('unexpectederrors.txt', { flags: 'a', encoding: 'utf8' });
        client.channels.cache.get("899050018466586665").send({ embeds: [feedbackEmbed], allowedMentions: { parse: [] } })
        interaction.reply({
            content: `**Your feedback has been sent! Thank you for contributing!**\n Content: \n\`${feedbacktxt}\`\nJoin the support server code \`kPKrgNd9wK\` to see what an admin will reply.\n*P.S It would've been nice if you could vote for us on <https://top.gg/bot/859363046185893890/vote> so we could reach more people!\n I'm deeply greatful :muscle:*`, allowedMentions: { repliedUser: false }
        })

    },
}