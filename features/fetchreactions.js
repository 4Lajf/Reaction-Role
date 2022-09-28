const config = require("./config.json");
var mysql = require('mysql');
const fs = require("fs");
// Basic welcome message feature
module.exports = (client, instance) => {
    var con = mysql.createConnection({
        host: config.server_ip,
        user: config.reactionrole_username,
        password: config.reactionrole_password,
        port: "3306",
        database: config.reactionrole_database,
        charset: 'utf8mb4',
        multipleStatements: true
    });
    // Listen for new members joining a guild
    client.on('messageReactionAdd', async (reaction, user) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }

        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });
        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        if (user.id == "859363046185893890") {

            return;
        }
        let messageID = reaction.message.id
        let member = reaction.message.guild.members.cache.get(user.id)
        let guildID = reaction.message.guild.id
        const errorChannel = client.channels.cache.get('581959517345021963')
        // Now the message has been cached and is fully available

        if (reaction.emoji.id) {
            var reactionid = undefined
            if (reaction.emoji.animated === true)
                reactionid = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`
            else {
                reactionid = `<:${reaction.emoji.name}:${reaction.emoji.id}>`
            }
        } else {
            reactionid = reaction.emoji.name
        }
        let exists = await con2.execute(`SELECT EXISTS (SELECT message_id, emoji FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${reactionid}') AS result;`);
        if (exists[0][0].result == 1) {
            const logAdded = fs.createWriteStream('addedreactions.txt', { flags: 'a', encoding: 'utf8' });
            logAdded.write(`${getDate()} [${user.tag}] REACTED TO [${reaction.emoji.name}] ON [${reaction.message.guild.name}] COUNT [${reaction.count}] MESSAGE ID [${reaction.message.id}]\n`);
            console.log(`${getDate()} [${user.tag}] REACTED TO [${reaction.emoji.name}] ON [${reaction.message.guild.name}] COUNT [${reaction.count}] MESSAGE ID [${reaction.message.id}]`);

            let maxRoles = await con2.execute(`SELECT max FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${reactionid}'`);
            if (maxRoles[0][0].max > 0) {
                let userRoles = reaction.message.guild.members.cache.get(user.id).roles.cache.map(m => m.id)
                let fetchRoles = await con2.execute(`SELECT role_id FROM reactionrole WHERE message_id = '${messageID}'`);
                let menuRoles = []
                for (var i = 0; i < fetchRoles[0].length; i++) {
                    menuRoles.push(fetchRoles[0][i].role_id)
                }
                function getArraysIntersection(a1, a2) {
                    return a1.filter(function (n) { return a2.indexOf(n) !== -1; });
                }
                var intersectingRoles = getArraysIntersection(userRoles, menuRoles);
                console.log(maxRoles[0][0].max + 1)
                if (intersectingRoles.length >= maxRoles[0][0].max) {
                    user.send(`:x: The maxium amout of roles you can take from this menu is **${maxRoles[0][0].max}**`)
                    const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                    try {
                        for (const reaction of userReactions.values()) {
                            await reaction.users.remove(user.id);
                        }
                    } catch (error) {
                        console.error(`Failed to remove reactions.\n${error}`);
                    }
                    return false;
                }
            }
            let whiteListExist = await con2.execute(`SELECT EXISTS (SELECT message_id FROM whitelist WHERE message_id = '${messageID}') AS result;`);
            if (whiteListExist[0][0].result == 1) {
                let WLuserRoles = reaction.message.guild.members.cache.get(user.id).roles.cache.map(m => m.id)
                let WLfetchRoles = await con2.execute(`SELECT role_id FROM whitelist WHERE message_id = '${messageID}'`);
                if (WLfetchRoles[0][0].role_id != "none") {
                    let WLmenuRoles = []
                    let WLmenuRolesNames = []
                    for (var i = 0; i < WLfetchRoles[0].length; i++) {
                        WLmenuRoles.push(WLfetchRoles[0][i].role_id)
                    }
                    for (var i = 0; i < WLfetchRoles[0].length; i++) {
                        var names = await reaction.message.guild.roles.fetch(WLmenuRoles[i])
                        WLmenuRolesNames.push(names.name)
                    }
                    function getArraysIntersection(a1, a2) {
                        return a1.filter(function (n) { return a2.indexOf(n) !== -1; });
                    }
                    var intersectingRoles = getArraysIntersection(WLuserRoles, WLmenuRoles);
                    if (intersectingRoles.length === 0) {
                        let embedDesc = "";
                        for (var i = 0; i < WLmenuRolesNames.length; i++) {
                            embedDesc += `        - **${WLmenuRolesNames[i]}**\n`
                        }
                        user.send(`:x: You must have one of the following roles to react to this\n${embedDesc}`)
                        const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                        try {
                            for (const reaction of userReactions.values()) {
                                await reaction.users.remove(user.id);
                            }
                        } catch (error) {
                            console.error(`Failed to remove reactions.\n${error}`);
                        }
                        return false;
                    }
                }
            }

            let blackListExist = await con2.execute(`SELECT EXISTS (SELECT message_id FROM blacklist WHERE message_id = '${messageID}') AS result;`);
            if (blackListExist[0][0].result == 1) {
                let BLuserRoles = reaction.message.guild.members.cache.get(user.id).roles.cache.map(m => m.id)
                let BLfetchRoles = await con2.execute(`SELECT role_id FROM blacklist WHERE message_id = '${messageID}'`);
                if (BLfetchRoles[0][0].role_id != "none") {
                    let BLmenuRoles = []
                    let BLmenuRolesNames = []
                    for (var i = 0; i < BLfetchRoles[0].length; i++) {
                        BLmenuRoles.push(BLfetchRoles[0][i].role_id)
                    }
                    for (var i = 0; i < BLfetchRoles[0].length; i++) {
                        var names = await reaction.message.guild.roles.fetch(BLmenuRoles[i])
                        BLmenuRolesNames.push(names.name)
                    }
                    function getArraysIntersection(a1, a2) {
                        return a1.filter(function (n) { return a2.indexOf(n) !== -1; });
                    }
                    var intersectingRoles = getArraysIntersection(BLuserRoles, BLmenuRoles);
                    if (intersectingRoles.length > 0) {
                        let embedDesc = "";
                        for (var i = 0; i < BLmenuRolesNames.length; i++) {
                            embedDesc += `        - **${BLmenuRolesNames[i]}**\n`
                        }
                        user.send(`:x: The following roles are preventing you from reacting to this\n${embedDesc}`)
                        const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                        try {
                            for (const reaction of userReactions.values()) {
                                await reaction.users.remove(user.id);
                            }
                        } catch (error) {
                            console.error(`Failed to remove reactions.\n${error}`);
                        }
                        return false;
                    }
                }
            }


            let durItvExists = await con2.execute(`SELECT message_id, emoji, slowmode, role_id, duration FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${reactionid}'`);
            let roleid = durItvExists[0][0].role_id
            if (durItvExists[0][0].duration > 0) {
                var guildid = reaction.message.guild.id
                let duration = durItvExists[0][0].duration
                let slowmode = durItvExists[0][0].slowmode
                var timedRoleQuery = `INSERT INTO timedrole (user_id, role_id, guild_id, message_id, date_added, date_ending) VALUES (${user.id}, ${roleid}, ${guildid}, ${reaction.message.id}, ${dateNow}, ${dateNow + parseInt(slowmode) * 60000});`;
                con.query(timedRoleQuery, function (err, result) {
                    if (err) throw err;
                })
            }

            if (durItvExists[0][0].slowmode > 0) {
                let exists = await con2.execute(`SELECT EXISTS (SELECT user_id, role_id FROM slowmode WHERE user_id = '${user.id}' AND role_id = '${roleid}') AS result;`);
                let checkslowmode = await con2.execute(`SELECT slowmode FROM reactionrole WHERE message_id = '${messageID}';`);
                let slowmode = checkslowmode[0][0].slowmode
                if (exists[0][0].result == 0) {
                    var invervalQuery = `INSERT INTO slowmode (user_id, role_id, guild_id, message_id, date_added, date_ending, slowmode) VALUES (${user.id}, ${roleid}, ${guildID}, ${messageID}, ${dateNow}, ${dateNow + parseInt(slowmode) * 60000}, ${slowmode});`;
                    con.query(invervalQuery, function (err, result) {
                        if (err) throw err;
                    })
                    await reaction.message.guild.roles.fetch()
                    let role = reaction.message.guild.roles.cache.get(roleid)
                    member.roles.add(role)
                    return;
                }
                let checkDateAdded = await con2.execute(`SELECT date_added FROM slowmode WHERE role_id = '${roleid}' AND user_id = '${member.id}'`);
                let dateAdded = parseInt(checkDateAdded[0][0].date_added)
                if (dateNow < dateAdded + parseInt(slowmode) * 60000) {
                    var timeRemaining = dateNow - (dateAdded + parseInt(slowmode) * 60000)
                    const moment = require("moment");
                    require("moment-duration-format");
                    const timetodm = moment.duration(timeRemaining).format(" D [days], H [hrs], m [mins], s [secs]");
                    user.send(`:x: You must wait \`T${timetodm}\` before you can take that role again!`)
                    return;
                } else {
                    await con2.execute(`UPDATE slowmode SET date_added = "${dateNow}" WHERE user_id = '${member.id}' AND role_id = '${roleid}'`);
                    await con2.execute(`UPDATE slowmode SET date_ending = "${dateNow + parseInt(slowmode) * 60000}" WHERE user_id = '${member.id}' AND role_id = '${roleid}'`);
                }
            }

            await reaction.message.guild.roles.fetch()
            let role = reaction.message.guild.roles.cache.get(roleid)
            member.roles.add(role).catch(error => {
                reaction.message.channel.send({
                    content: `:x: I don't have permission to add you to this role
       or my highest role is lower than role you're trying to add`, ephemeral: true, allowedMentions: { parse: [] }

                })
                return;
            });

            return;
        } else {
            return;
        }
    });

    client.on('messageReactionRemove', async (reaction, user) => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }

        // When a reaction is received, check if the structure is partial
        if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        if (user.id == "859363046185893890") {

            return;
        }

        const mysql2 = require('mysql2/promise');
        const con2 = await mysql2.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });

        let messageID = reaction.message.id
        let member = reaction.message.guild.members.cache.get(user.id)
        // Now the message has been cached and is fully available
        if (reaction.emoji.id) {
            if (reaction.emoji.animated === true)
                var reactionid = `<a:${reaction.emoji.name}:${reaction.emoji.id}>`
            else {
                var reactionid = `<:${reaction.emoji.name}:${reaction.emoji.id}>`
            }
        } else {
            var reactionid = reaction.emoji.name
        }

        let exists = await con2.execute(`SELECT EXISTS (SELECT message_id, emoji FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${reactionid}') AS result;`);
        const logRemoved = fs.createWriteStream('removedreactions.txt', { flags: 'a', encoding: 'utf8' });
        logRemoved.write(`${getDate()} [${user.tag}] REMOVED REACTION TO [${reaction.emoji.name}] ON [${reaction.message.guild.name}] COUNT [${reaction.count}] MESSAGE ID [${reaction.message.id}]\n`);
        console.log(`${getDate()} [${user.tag}] REMOVED REACTION TO [${reaction.emoji.name}] ON [${reaction.message.guild.name}] COUNT [${reaction.count}] MESSAGE ID [${reaction.message.id}]`);
        if (exists[0][0].result == 1) {
            let CheckQuery = await con2.execute(`SELECT role_id FROM reactionrole WHERE message_id = '${messageID}' AND emoji = '${reactionid}'`);
            let roleid = CheckQuery[0][0].role_id

            let checkBlackList = await con2.execute(`SELECT EXISTS (SELECT role_id FROM blacklist WHERE message_id = '${messageID}' AND role_id = '${roleid}') AS result`);
            let isRoleBlacklisted = checkBlackList[0][0].result
            if (isRoleBlacklisted == 1) {
                const userReactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                try {
                    for (const reaction of userReactions.values()) {
                        await reaction.users.remove(user.id);
                    }
                } catch (error) {
                    console.error(`Failed to remove reactions.\n${error}`);
                }
                return false;
            }


            let role = await reaction.message.guild.roles.fetch(roleid)
            member.roles.remove(role).catch(error => {
                reaction.message.channel.send({
                    content: `:x: I don't have permission to remove you from this role
       or my highest role is lower than role you're trying to remove`, ephemeral: true, allowedMentions: { parse: [] }
                })
                return;
            });
            let exists = await con2.execute(`SELECT EXISTS (SELECT user_id, role_id FROM timedrole WHERE user_id = '${user.id}' AND role_id = '${roleid}') AS result;`);
            if (exists[0][0].result == 1) {
                await con2.execute(`DELETE FROM timedrole WHERE user_id = ${user.id} AND message_id = ${messageID}`);
            }

        } else {
            return;
        }
    });
}

// Configuration for this feature
module.exports.config = {
    // The display name that server owners will see.
    // This can be changed at any time.
    displayName: 'Fetch Reactions',

    // The name the database will use to set if it is enabled or not.
    // This should NEVER be changed once set, and users cannot see it.
    dbName: 'FETCH_REACTIONS'
}