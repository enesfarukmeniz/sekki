const embedBuilder = require("./embedBuilder.js");
const config = require('./../config.json');
const winston = require("winston");
require("winston-daily-rotate-file");
const logger = {
    generic: function (client, message, log) {
        const level = "info";
        if (message) {
            logger.embedLogger(client, level, embedBuilder.message(message, level).embed, log);
        } else {
            logger.embedLogger(client, level, embedBuilder.empty(level).embed, log);
        }
    },
    log: function (client, data, event, wrapper) {
        const level = "info";
        const logMessage = embedBuilder[wrapper](data, level, event);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    warn: function (client, data, event, wrapper) {
        const level = "warning";
        const logMessage = embedBuilder[wrapper](data, level, event);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    error: function (client, data, event, wrapper) {
        const level = "error";
        const logMessage = embedBuilder[wrapper](data, level, event);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    imgError: function (client, data, error, wrapper, embedImage) {
        const level = "error";
        const logMessage = embedBuilder[wrapper](data, level, error, embedImage);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    embedLogger: function (client, level, embed, message = "") {
        const logChannel = client.channels.filter(channel => config.logChannel == channel.id).first();
        if (logChannel) {
            logChannel.sendMessage(message, {
                embed: embed
            });
        } else {
            console.log("No log channel");
        }
    }
};

module.exports = logger;