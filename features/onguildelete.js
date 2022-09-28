const { MessageEmbed } = require('discord.js');
module.exports = (client) => {

    client.on('guildDelete', async guild => {
        // Log Channel for new servers
        const newServerChan = client.channels.cache.get('606224155792113695')
        const secEmb = new MessageEmbed()
            .setTitle(`**Left Server**`)
            .setColor(`RED`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Name', value: `${guild.name} [${guild.id}]`, inline: true },
                { name: 'Users', value: `${guild.memberCount}`, inline: true },
                { name: 'Servers In', value: `${client.guilds.cache.size}`, inline: true },
            )
            .setTimestamp()

        newServerChan.send({ embeds: [secEmb], allowedMentions: { parse: [] } });
    })

}

// Configuration for this feature
module.exports.config = {
    // The display name that server owners will see.
    // This can be changed at any time.
    displayName: 'OnGuildCreate',

    // The name the database will use to set if it is enabled or not.
    // This should NEVER be changed once set, and users cannot see it.
    dbName: 'ON_GUILD_CREATE'
}