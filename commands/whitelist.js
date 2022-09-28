const config = require("./config.json");
const { Permissions } = require('discord.js');
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Restrict access to the command to supplied roles', // Required for slash commands
    slash: true,
    testOnly: false,
    options: [
        {
            name: 'command', // Must be lower case
            description: 'Command name',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'role', // Must be lower case
            description: 'Role mention',
            required: true,
            type: 8, // This argument is a role
        },
    ],
    callback: async ({ interaction, client }) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        let botMember = interaction.guild.members.cache.get("859363046185893890");
        let member = interaction.member
        let serverid = interaction.guild.id
        var commandArg = interaction.options.get('command').value
        var roleArg = interaction.options.get('role').value
        const commandChannel = client.channels.cache.get('923378105454841856')

        commandChannel.send({
            content: `${getDate()} COMMAND \`/whitelist\` WAS EXECUTED BY \`${interaction.user.username}\`\nCOMMAND: \`${commandArg}\`\nROLE: \\${roleArg}`
        })


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
            let query = await con2.execute(`SELECT EXISTS (SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'whitelist') AS result;`);
            query = query[0][0].result
            if (query == 0) {
                return [false];
            } else {
                let query = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverid}' AND command = 'whitelist'`);
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


        const commands = 'about add delete embed embededit feedback help info logchannel musicconversion replyfeedback uptime whitelist yt';

        if (commands.includes(commandArg) === true) {
            let serverID = interaction.guild.id;
            let roleID = roleArg;
            let query = await con2.execute(`SELECT EXISTS (SELECT command, server_id, role_id FROM verify WHERE server_id = '${serverID}' AND command = '${commandArg}' AND role_id = '${roleID}') AS result;`);
            query = query[0][0].result
            if (query === 1) {
                await con2.execute(`DELETE FROM verify WHERE server_id = '${serverID}' AND command = '${commandArg}' AND role_id = '${roleID}';`);
                let roles = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverID}' AND command = '${commandArg}'`);
                console.log(roles[0][0])
                if (!roles[0][0]) {
                    interaction.reply({ content: `Command \`${commandArg}\` is no longer restricted to any role`, allowedMentions: { parse: [] } })
                    return;
                }
                let rolesArr = []
                for (let i = 0; i < roles[0].length; i++) {
                    rolesArr.push(`<@&${roles[0][i].role_id}>\n`)
                }
                interaction.reply({ content: `Now only roles that can use \`${commandArg}\` are:\n ${rolesArr}*\`MANAGE_SERVER\` permission always overridees it*`, allowedMentions: { parse: [] } })
                return;
            } else {
                await con2.execute(`INSERT INTO verify (server_id, command, role_id) VALUES ('${serverID}', '${commandArg}', '${roleID}');`);
                let roles = await con2.execute(`SELECT role_id FROM verify WHERE server_id = '${serverID}' AND command = '${commandArg}'`);
                let rolesArr = []
                console.log(roles[0])
                console.log(roles[0].length)
                for (let i = 0; i < roles[0].length; i++) {
                    rolesArr.push(`<@&${roles[0][i].role_id}>\n`)
                }
                interaction.reply({
                    content: `Now only roles that can use \`${commandArg}\` are:\n${rolesArr}*\`MANAGE_SERVER\` permission always overridees it*`, allowedMentions: { parse: [] }
                })
                return;
            }
        } else {
            interaction.reply({ content: `:x: Command ${commandArg} does not exist`, ephemeral: true, allowedMentions: { parse: [] } })
            return;
        }
    },
}