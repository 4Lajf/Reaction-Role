const { Client, Intents } = require('discord.js');
const WOKCommands = require('wokcommands')
const path = require('path')
const config = require("./config.json");
const fs = require("fs");

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    allowedMentions: { parse: [`users`], repliedUser: true }
});

client.on('ready', () => {
    // The client object is required as the first argument.
    // The second argument is the options object.
    // All properties of this object are optional.

    new WOKCommands(client, {
        // The name of the local folder for your command files
        commandsDir: path.join(__dirname, 'commands'),

        // The name of the local folder for your feature files
        featuresDir: path.join(__dirname, 'features'),

        // The name of the local file for your message text and translations
        // Omitting this will use the built-in message path
        messagesPath: '',

        // Allow importing of .ts files
        typeScript: true,

        // If WOKCommands warning should be shown or not, default true
        showWarns: false,

        // How many seconds to keep error messages before deleting them
        // -1 means do not delete, defaults to -1
        delErrMsgCooldown: 30,

        // What language your bot should use
        // Must be supported in your messages.json file
        defaultLangauge: 'english',

        // If your commands should not be ran by a bot, default false
        ignoreBots: false,

        // If interactions should only be shown to the one user
        // Only used for when WOKCommands sends an interaction response
        // Default is true
        ephemeral: true,

        // Various options for your MongoDB database connection
        dbOptions: {
            // These 4 are the default options
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        },

        // What server/guild IDs are used for testing only commands & features
        // Can be a single string if there is only 1 ID
        testServers: ['494883916335939614'],

        // What built-in commands should be disabled.
        // Note that you can overwrite a command as well by using
        // the same name as the command file name.
        disabledDefaultCommands: [
            'help',
            'command',
            'language',
            'prefix',
            'requiredrole',
            'channelonly'
        ],

        // When connecting to a Mongo database.
        // For more infomration view the "DATABASES" section
        // of this documentation.
        mongoUri: process.env.MONGO_URI,

        // Provides additional debug logging
        debug: false
    })
        // Here are some additional methods that you can chain
        // onto the contrustor call. These will eventually be
        // merged into the above object, but for now you can
        // use them:

        // The default is !
        .setDefaultPrefix('$')

        // Used for the color of embeds sent by WOKCommands
        .setColor(0xff0000)

        // User your own ID
        // If you only have 1 ID then you can pass in a string instead
        .setBotOwner(['351006685587963916'])

    async function checkTimedRole() {
        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
            host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });
        let query = await con2.execute(`SELECT user_id, role_id, guild_id, date_added, date_ending FROM timedrole`);
        for (var i = 0; i < query[0].length; i++) {
            var memberID = query[0][i].user_id
            var roleID = query[0][i].role_id
            var guildID = query[0][i].guild_id
            var dateEnding = query[0][i].date_ending
            var timeNow = Date.now()
            if (dateEnding < timeNow) {
                console.log("found")
                const fetchGuild = await client.guilds.cache.get(guildID)
                const member = fetchGuild.members.fetch().then(fetchedMembers => {
                    const fetchedMember = fetchedMembers.filter(member => member.id === memberID);
                    const getMember = fetchedMember.get(memberID)
                    getMember.roles.remove(roleID)
                    const logRemoved = fs.createWriteStream('removedreactions.txt', { flags: 'a', encoding: 'utf8' });
                    console.log(`${getDate()}[AUTO] REMOVED ROLE [${roleID}] FROM [${getMember.user.tag}] ON SERVER [${fetchGuild.name}]`);
                    logRemoved.write(`${getDate()}[AUTO] REMOVED ROLE [${roleID}] FROM [${getMember.user.tag}] ON SERVER [${fetchGuild.name}]`);
                });
                await con2.execute(`DELETE FROM timedrole WHERE user_id = ${memberID} AND role_id = ${roleID}`);
            } else {
                console.log("nothing found")
            }
        }
    }
    setInterval(async () => { checkTimedRole() }, 60000);

    client.user.setPresence({ activities: [{ name: 'with roles | /help ' }], status: 'online' });
})

// 'a' flag stands for 'append'
function getDate() {
    var currentdate = new Date();
    var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
    return logtime
}

const dcelog = fs.createWriteStream('discorderrors.txt', { flags: 'a', encoding: 'utf8' });
const dcwlog = fs.createWriteStream('discordwarns.txt', { flags: 'a', encoding: 'utf8' });
const debug = fs.createWriteStream('debug.txt', { flags: 'a', encoding: 'utf8' });
const exeptionlog = fs.createWriteStream('expections.txt', { flags: 'a', encoding: 'utf8' });

client.on("error", (e) => {
    dcelog.write(`${getDate()} [API ERROR]${e}\n`)
    console.log(`${getDate()} [API ERROR]${e}`)
});
client.on("warn", (e) => {
    dcwlog.write(`${getDate()} [API WARN]${e}\n`)
    console.log(`${getDate()} [API WARN]${e}`)
});
client.on("debug", (e) => {
    debug.write(`${getDate()} [DEBUG]${e}\n`)
});
process.on("unhandledRejection", (reason, p) => {
    exeptionlog.write(`${getDate()} [AntiCrash] :: Unhandled Rejection/Catch\n[REASON]${reason}\n`);
    console.log(`${getDate()} [AntiCrash] :: Unhandled Rejection/Catch\n [REASON]${reason}\n[PROMISE]\n`)
    console.log(p)
});
process.on("uncaughtException", (err, origin) => {
    exeptionlog.write(`${getDate()} [AntiCrash] :: Uncaught Exception/Catch\n[ERR]${err}\n[ORIGIN]${origin}\n`);
    console.log(`${getDate()} [AntiCrash] :: Uncaught Exception/Catch\n [ERR]${err}\n[ORIGIN]${origin}`)
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
    exeptionlog.write(`${getDate()} [AntiCrash] :: Uncaught Exception/Catch (MONITOR)\n[ERR]${err}\n[ORIGIN]${origin}\n`);
    console.log(`${getDate()} [AntiCrash] :: Uncaught Exception/Catch (MONITOR)\n [ERR]${err}\n[ORIGIN]${origin}`)
});


client.login(config.token);