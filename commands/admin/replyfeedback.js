const { Permissions } = require('discord.js');
var mysql = require('mysql');
const config = require("../config.json");
const { MessageEmbed } = require('discord.js');
module.exports = {
    category: 'All',
    guildOnly: true,
    description: 'Give us some feedback!', // Required for slash commands
    slash: true,
    testOnly: true,
    options: [
        {
            name: 'message_link', // Must be lower case
            description: 'Message that will be edited',
            required: true,
            type: 3, // This argument is a string
        },
        {
            name: 'reply', // Must be lower case
            description: 'What to reply with',
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
        //Establish database connection
        var con = mysql.createConnection({
     host: "127.0.0.1",
            user: config.reactionrole_username,
            password: config.reactionrole_password,
            port: "3306",
            database: config.reactionrole_database,
            charset: 'utf8mb4'
        });

        //Prepare bot client, the member that called the command and the channel that command was called in
        let member = interaction.member
        let messageLink = interaction.options._hoistedOptions[0].value
        const messageID = messageLink.match(/.{18}$/g)
        const message = await interaction.channel.messages.fetch(messageID[0])
        const replycontent = interaction.options._hoistedOptions[1].value

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

        if (member.id !== "351006685587963916") {
            return false;
        }

        const receivedEmbed = message.embeds[0];
        const editEmbed = new MessageEmbed(receivedEmbed).addFields(
            { name: 'Admin reply', value: replycontent, inline: false },
        )

        message.edit({ embeds: [editEmbed] });
        interaction.reply({
            content: `Message replied`, ephemeral: true, allowedMentions: { repliedUser: false }
        })

    },
}