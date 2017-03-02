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
    noCommand: function() {
        //console.log(arguments)
    },
    missingPermission: function() {
        //console.log(arguments)
    },
    log: function () {

    },
    warn: function () {

    },
    error : function () {

    }
};

module.exports = logger;