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
        const logMessage = embedBuilder[wrapper](data, level);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    warn: function (client, data, event, wrapper) {
        const level = "warning";
        const logMessage = embedBuilder[wrapper](data, level);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    error: function (client, data, event, wrapper) {
        const level = "error";
        const logMessage = embedBuilder[wrapper](data, level);
        logger.embedLogger(client, level, logMessage.embed, logMessage.message);
    },
    imgError: function () {
    }, /*: function (client, message, error, type, embedImage) {
     const level = "error";
     },*/
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