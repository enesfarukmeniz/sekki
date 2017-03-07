const logger = require("./logger.js");
const sharp = require('sharp');
const base64 = require('node-base64-image');
const moment = require('moment');
require("moment-duration-format");
const config = require('./../config.json');
const util = require("./util.js");

const commands = {
    help: {
        help: "help [%command%](obviously lol)",
        description: "Helps about commands lol",
        run: function (database, client, message, [command]) {
            message.delete();
            if (command) {
                if (!commands[command]) {
                    util.userNotifier(message.channel, `**${command}** is not valid command.`);
                } else {
                    util.userNotifier(message.channel, `\`\`\`${command} command usage: ${config.prefix}${commands[command].help}\nIt does: ${commands[command].description}\`\`\``, 10);
                }
            } else {
                let helpMessage = "```fix\n";
                Object.keys(commands).forEach(key => {
                    helpMessage += "Command: " + key + "\nUsage: " + config.prefix + commands[key].help;
                    helpMessage += "\nWhat: " + commands[key].description;
                    helpMessage += "\nGuild Only: " + (commands[key].guild === true ? "TRUE" : "FALSE");
                    helpMessage += "\nPermissions: " + (commands[key].permissions && commands[key].permissions.length ? commands[key].permissions.join(", ") : "NONE");
                    helpMessage += "\n\n";
                });
                helpMessage += "```";
                util.userNotifier(message.channel, helpMessage, 10);
            }
        }
    },
    ping: {
        help: "ping",
        description: "ping pong",
        run: function (database, client, message) {
            message.delete();
            message.channel.sendMessage("ping...")
                .then(msg => {
                    msg.edit(`Pong! ${msg.createdTimestamp - message.createdTimestamp}ms`);
                });
        }
    },
    github: {
        help: "github",
        description: "Returns github address of project",
        run: function (database, client, message) {
            message.edit("https://github.com/enesfarukmeniz/sekki");
        }
    },
    info: {
        help: "info",
        description: "Info about Sekki",
        run: function (database, client, message) {
            message.delete();
            const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
            let info = "```asciidoc\n= STATISTICS =\n" +
                "• Mem Usage  :: " + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB\n" +
                "• Uptime     :: " + duration + "\n" +
                "• Users      :: " + client.users.size.toLocaleString() + "\n" +
                "• Servers    :: " + client.guilds.size.toLocaleString() + "\n" +
                "• Channels   :: " + client.channels.size.toLocaleString() + "```";
            util.userNotifier(message.channel, info, 10);
        }
    },
    reply: {
        help: "reply %message_id% %message%",
        description: "Replies a message with id",
        run: function (database, client, message, [messageId, ...messageArray]) {
            message.channel.fetchMessages({limit: 1, around: messageId}).then(messages => {
                const replyMessage = messages.first();
                if (replyMessage) {
                    message.channel.sendMessage("", {
                        embed: {
                            color: 0xFFFFFF,
                            author: {
                                name: replyMessage.author.username,
                                icon_url: replyMessage.author.avatarURL
                            },
                            description: replyMessage.content,
                            timestamp: replyMessage.createdAt
                        }
                    }).then(() => message.channel.sendMessage(messageArray.join(" ")).then(() => message.delete()));
                } else {
                    message.delete();
                    util.userNotifier(message.channel, `Message with ${messageId} id not found`);
                }
            });
        }
    },
    mreply: {
        help: "mreply %message_id% %message%",
        description: "Replies a message with id and mentions message owner",
        run: function (database, client, message, [messageId, ...messageArray]) {
            message.channel.fetchMessages({limit: 1, around: messageId}).then(messages => {
                const replyMessage = messages.first();
                if (replyMessage) {
                    message.channel.sendMessage("", {
                        embed: {
                            color: 0xFFFFFF,
                            author: {
                                name: replyMessage.author.username,
                                icon_url: replyMessage.author.avatarURL
                            },
                            description: replyMessage.content,
                            timestamp: replyMessage.createdAt
                        }
                    }).then(() => message.channel.sendMessage(replyMessage.author + " " + messageArray.join(" ")).then(() => message.delete()));
                } else {
                    message.delete();
                    util.userNotifier(message.channel, `Message with ${messageId} id not found`);
                }
            });
        }
    },
    emojify: {
        help: "emojify [%imageurl%]",
        description: "Shows how image looks like if becomes emoji. Use command with image or url",
        run: function (database, client, message, [url]) {
            if (url) {
                base64.encode(url, {}, function (error, response) {
                    if (!error) {
                        sharp(response).resize(32, 32).png().toBuffer(function (err, buffer) {
                            if (!err) {
                                message.channel.sendFile(buffer, "image.png", "Big Emoji");
                            } else {
                                if (util.getLogData(database, "/log/channel/" + message.channel.id)
                                    && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                                    && util.getLogData(database, "/log/event/imgError")) {
                                    logger.imgError(client, message, "err", "sharp", false);
                                }
                                util.userNotifier(message.channel, "Couldn't convert image");
                            }
                        });
                        sharp(response).resize(22, 22).png().toBuffer(function (err, buffer) {
                            if (!err) {
                                message.channel.sendFile(buffer, "image.png", "Small Emoji");
                            } else {
                                if (util.getLogData(database, "/log/channel/" + message.channel.id)
                                    && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                                    && util.getLogData(database, "/log/event/imgError")) {
                                    logger.imgError(client, message, err, "sharp", false);
                                }
                                util.userNotifier(message.channel, "Couldn't convert image");
                            }
                        });
                    } else {
                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                            && util.getLogData(database, "/log/event/imgError")) {
                            logger.imgError(client, message, error, "base64", false);
                        }
                        util.userNotifier(message.channel, "Couldn't get image");
                    }
                });
            }
            else {
                if (!message.attachments.array().length) {
                    util.userNotifier(message.channel, "No url or image attached");
                } else {
                    const image = message.attachments.array().pop();
                    if (!image.height || !image.width) {
                        util.userNotifier(message.channel, "Image unidentified");
                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                            && util.getLogData(database, "/log/event/imgError")) {
                            logger.imgError(client, message, null, "attachment", true);
                        }
                    } else {
                        base64.encode(image.url, {}, function (error, response) {
                            if (!error) {
                                sharp(response).resize(32, 32).png().toBuffer(function (err, buffer) {
                                    if (!err) {
                                        message.channel.sendFile(buffer, "image.png", "Big Emoji");
                                    } else {
                                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                                            && util.getLogData(database, "/log/event/imgError")) {
                                            logger.imgError(client, message, err, "sharp", true);
                                        }
                                        util.userNotifier(message.channel, "Couldn't convert image");
                                    }
                                });
                                sharp(response).resize(22, 22).png().toBuffer(function (err, buffer) {
                                    if (!err) {
                                        message.channel.sendFile(buffer, "image.png", "Small Emoji");
                                    } else {
                                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                                            && util.getLogData(database, "/log/event/imgError")) {
                                            logger.imgError(client, message, err, "sharp", true);
                                        }
                                        util.userNotifier(message.channel, "Couldn't convert image");
                                    }
                                });
                            } else {
                                if (util.getLogData(database, "/log/channel/" + message.channel.id)
                                    && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                                    && util.getLogData(database, "/log/event/imgError")) {
                                    logger.imgError(client, message, error, "base64", true);
                                }
                                util.userNotifier(message.channel, "Couldn't get image");
                            }
                        });

                    }
                }
            }
        }
    },
    del: {
        help: "del [%number%]",
        description: "Deletes user's own messages. Default %number% value is 1, max is 100. Not guaranteed to delete %number% of messages cause of discord api limitations",
        run: function (database, client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.filterArray(msg => msg.author.id === client.user.id).slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                            && util.getLogData(database, "/log/event/messageDelete")) {
                            logger.log(client, msg, "messageDelete", "message");
                        }
                        msg.delete();
                    });
                }
            }));
        }
    },
    delall: {
        help: "delall [%number%]",
        permissions: ["MANAGE_MESSAGES"],
        guild: true,
        description: "Deletes all users' messages. Default %number% value is 1, max 100",
        run: function (database, client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.array().slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        if (util.getLogData(database, "/log/channel/" + message.channel.id)
                            && util.getLogData(database, "/log/channel/" + message.channel.guild.id)
                            && util.getLogData(database, "/log/event/messageDelete")) {
                            logger.log(client, msg, "messageDelete", "message");
                        }
                        msg.delete();
                    });
                }
            }));
        }
    },
    save: {
        help: "save %messageid%",
        description: "Save message with %messageid% to configured saveChannel",
        run: function (database, client, message, [messageId, ..._]) {
            message.delete();
            message.channel.fetchMessages({limit: 1, around: messageId}).then(messages => {
                const saveMessage = messages.first();
                const saveChannel = client.channels.filter(channel => config.saveChannel == channel.id).first();
                if (saveChannel) {
                    saveChannel.sendMessage("", {
                        embed: {
                            color: 0x7289DA,
                            author: {
                                name: saveMessage.author.username,
                                icon_url: saveMessage.author.avatarURL
                            },
                            description: saveMessage.content,
                            timestamp: saveMessage.createdAt,
                            footer: {
                                text: saveMessage.guild ? (`${saveMessage.guild.name} : #${saveMessage.channel.name}`) : "Private",
                                icon_url: saveMessage.guild ? saveMessage.guild.iconURL : ""
                            }
                        }
                    });
                } else {
                    logger.generic(client, message, "No save channel");
                    util.userNotifier(message.channel, `No command named **${command}**.`);
                }
            });
        }
    },
    log: {
        help: "log %key% %value%",
        description: "Sets logging options for key %key% to value %value% ",
        run: function (database, client, message, [key, value]) {
            message.delete();
            const valueMap = {
                "yes": true,
                "true": true,
                "1": true,
                "on": true,
                "no": false,
                "false": false,
                "0": false,
                "off": false
            };
            util.setLogData(database, key, valueMap[value]);
            logger.generic(client, message, `Logging for ${key} changed to ${valueMap[value]}`);
        }
    }
};

module.exports = commands;