const { MessageEmbed } = require('discord.js');
module.exports = (client) => {

    client.on('guildCreate', async guild => {
        function getDate() {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            return logtime
        }
        v
        // Embed
        let embed = new MessageEmbed()
            .setTitle(`**Hello and welcome!**`)
            .setColor('BLUE')
            .setURL('docs.4lajf.com')
            .setDescription(`Jump straight to creating Role Menus by typing \`/add\` or type \`help\` to see my other functions.
            Click [here](http://docs.4lajf.com/) for further help.`)
        let owner = await guild.fetchOwner()
        owner.send({ embeds: [embed], allowedMentions: { parse: [] } }).catch(error => {
            var currentdate = new Date();
            var logtime = `[${(currentdate.getMonth() + 1)}.${currentdate.getDate()} @ ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}]`
            console.log(`${getDate()}[ERROR:onguildcreate.js]Owner of ${guild.name}[${guild.id}] has disabled DMs`)
            return;
        });;

        // Log Channel for new servers
        const newServerChan = client.channels.cache.get('606224155792113695')
        const secEmb = new MessageEmbed()
            .setTitle(`**Joined Server**`)
            .setColor(`GREEN`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Name', value: `${guild.name} [${guild.id}]`, inline: true },
                { name: 'Owner', value: `${owner.displayName} [${owner.id}]`, inline: true },
                { name: 'Users', value: `${guild.memberCount}`, inline: true },
                { name: 'Created at', value: `${guild.createdAt}`, inline: true },
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