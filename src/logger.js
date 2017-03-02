const winston = require("winston");
require("winston-daily-rotate-file");
//TODO lots of work here...
const logger = {
    mention: function (client, message) {
        let log = "";
        if (message.guild) {
            log += `Guild: ${message.guild.name}\n`;
            log += `Channel: ${message.channel.name}\n`;
        }
        log += `Timestamp: ${message.createdAt}\n`;
        log += `Message: ${message.author.username}: ${message.cleanContent}\n`;
        console.log(log);
    },
    generic: function (client, message, log) {
        //console.log(arguments)
    },
    missingPermission: function() {
        //console.log(arguments)
    },
    log: function (client, message, key) {

    },
    warn: function (client, message) {

    },
    error: function (client, message) {

    },
    imgError: function (client, message, error, embed) {

    },
    messageDelete: function (client, message) {

    }
};

module.exports = logger;