const winston = require("winston");
require("winston-daily-rotate-file");
const beautify = require('js-beautify').js_beautify

const embedBuilder = require("./embedBuilder.js");
const util = require("./util.js");
const config = require('./../config.json');

const winstonLogger = new (winston.Logger)({
    exitOnError: false,
    transports: [
        new winston.transports.DailyRotateFile({
            name: 'info-log',
            filename: 'logs/info-',
            datePattern: 'yyyy-MM-dd.log',
            level: 'info',
            json: false,
            prettyPrint: false
        }),
        new winston.transports.DailyRotateFile({
            name: 'warning-log',
            filename: 'logs/warning-',
            datePattern: 'yyyy-MM-dd.log',
            level: 'warn',
            json: false,
            prettyPrint: false
        }),
        new winston.transports.DailyRotateFile({
            name: 'error-log',
            filename: 'logs/error-',
            datePattern: 'yyyy-MM-dd.log',
            level: 'error',
            json: false,
            prettyPrint: false,
            handleExceptions: true,
            humanReadableUnhandledException: true
        })
    ]
});

const logger = {
    generic: function (logParams, client, message, log) {
        if (util.loggable(logParams)) {
            const level = "info";
            if (message) {
                logger.winstonLogger(level, client, logParams, message, log);
                logger.embedLogger(logParams, client, level, embedBuilder.message(message, level).embed, log);
            } else {
                logger.winstonLogger(level, client, logParams, message, log);
                logger.embedLogger(logParams, client, level, embedBuilder.empty(level).embed, log);
            }
        }
    },
    log: function (logParams, client, data, event, wrapper) {
        if (util.loggable(logParams)) {
            const level = "info";
            const logMessage = embedBuilder[wrapper](data, level, event);
            logger.winstonLogger(level, client, logParams, event, data);
            logger.embedLogger(logParams, client, level, logMessage.embed, logMessage.message);
        }
    },
    warn: function (logParams, client, data, event, wrapper) {
        if (util.loggable(logParams)) {
            const level = "warning";
            const logMessage = embedBuilder[wrapper](data, level, event);
            logger.winstonLogger(level, client, logParams, event, data);
            logger.embedLogger(logParams, client, level, logMessage.embed, logMessage.message);
        }
    },
    error: function (logParams, client, data, event, wrapper) {
        if (util.loggable(logParams)) {
            const level = "error";
            const logMessage = embedBuilder[wrapper](data, level, event);
            logger.winstonLogger(level, client, logParams, event, data);
            logger.embedLogger(logParams, client, level, logMessage.embed, logMessage.message);
        }
    },
    imgError: function (logParams, client, data, error, wrapper, embedImage) {
        if (util.loggable(logParams)) {
            const level = "error";
            const logMessage = embedBuilder[wrapper](data, level, error, embedImage);
            logger.winstonLogger(level, client, logParams, error, data, embedImage);
            logger.embedLogger(logParams, client, level, logMessage.embed, logMessage.message);
        }
    },
    embedLogger: function (logParams, client, level, embed, message = "") {
        //TODO message length
        if (util.loggable({level: level})) {
            const logChannelId = util.getData("/config/logChannels/default");
            if (logChannelId) {
                const logChannel = client.channels.filter(channel => logChannelId == channel.id).first();
                if (logChannel) {
                    logChannel.sendMessage(message, {
                        embed: embed
                    });
                } else {
                    console.log("Log channel " + logChannelId + " does not exist");
                }
            } else {
                console.log("Log channel not configured");
            }
        }

        const levelLogChannelId = util.getData("/config/logChannels/" + level);
        if (levelLogChannelId) {
            const levelLogChannel = client.channels.filter(channel => levelLogChannelId == channel.id).first();
            if (levelLogChannel) {
                levelLogChannel.sendMessage(message, {
                    embed: embed
                });
            } else {
                console.log("Level log channel " + levelLogChannelId + " does not exist for " + level);
            }
        } else {
            console.log("Level log channel not configured for " + level);
        }
    },
    winstonLogger: function (level, client, ...logData) {
        const levels = {
            "info": "info",
            "warning": "warn",
            "error": "error"
        };
        logData = require('util').inspect(logData);
        winstonLogger.log(levels[level], util.scrubOutput(client, JSON.stringify(logData, null, 4)));
    }
};

module.exports = logger;
