const { Permissions } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const config = require("./config.json");
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Take a look at the commands', // Required for slash commands
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
            content: `${getDate()} COMMAND \`/help\` WAS EXECUTED BY ${interaction.user.username}`
        })        

        async function getPermitedRoles() {
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'help') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'help'`);
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
        
        const helpEmbed = new MessageEmbed()
            .setColor("GREEN")
            .setTitle(`**Commands Menu**`)
            .setURL(`https://docs.4lajf.com`)
            .setDescription(`Check out our more detailed help menu and getting started guide at https://heartbeatdev.gitbook.io/getting-started/
\`/add\` - Add Role Menu to an existing message or a new embed message on the same channel
\`/edit\`       - Edit existing Role Menu
\`/delete\`     - Delete emojis from existing Role Menu
\`/embed\`      - Create a custom embed message
\`/embededit\`  - Edit your custom embed message
\`/whitelist\`  - Permit a role to access a command
\`/info\`       - Get info about a Role Menu
\`/logchannel\` - Select a channel to log role updates
\`/yt\`         - Search for a video on YouTub
\`/musicconversion\` - Toggle link conversion from Spotify to YouTube
\`/uptime\`     - Show the bot's uptime
\`/feedback\`   - Give us some feedback
\`/about\`      - Learn more about us!`)
            .setFooter(`${member.user.tag}`, `${member.user.avatarURL({ dynamic: true, format: 'png', size: 128 })}`);
        interaction.reply({ embeds: [helpEmbed], allowedMentions: { parse: [] } });

    },
}