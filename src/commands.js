const logger = require("./logger.js");
const sharp = require('sharp');
const base64 = require('node-base64-image');
const config = require('./../config.json');

const commands = {
    permtest: {
        permissions: ["KICK_MEMBERS", "BAN_MEMBERS"],
        guild: true,
        help: "permtest",
        run: function (client, message) {
        }
    },
    help: {
        help: "help [%command%](obviously lol)",
        run: function (client, message, [command]) {
            message.delete();
            if (command) {
                if (!commands[command]) {
                    message.channel.sendMessage(`**${command}** is not valid command.`);
                } else {
                    message.channel.sendMessage(`\`${command} command usage: ${config.prefix}${commands[command].help}\``)
                }
            } else {
                let helpMessage = "```fix\n";
                Object.keys(commands).forEach(key => {
                    helpMessage += "Command: " + key + "\nUsage: " + config.prefix + commands[key].help;
                    helpMessage += "\nGuild Only: " + (commands[key].guild === true ? "TRUE" : "FALSE");
                    helpMessage += "\nPermissions: " + (commands[key].permissions && commands[key].permissions.length ? commands[key].permissions.join(", ") : "NONE");
                    helpMessage += "\n\n";
                });
                helpMessage += "```";
                message.channel.sendMessage(helpMessage);
            }
        }
    },
    ping: {
        help: "ping",
        run: function (client, message) {
            message.delete();
            message.channel.sendMessage("ping...")
                .then(msg => {
                    msg.edit(`Pong! ${msg.createdTimestamp - message.createdTimestamp}ms`);
                });
        }
    },
    github: {
        help: "github",
        run: function (client, message) {
            message.edit("https://github.com/enesfarukmeniz/sekki");
        }
    },
    reply: {
        help: "reply %message_id% %message%",
        run: function (client, message, [messageId, ...messageArray]) {
            message.channel.fetchMessages({limit: 1, around: messageId}).then(messages => {
                const replyMessage = messages.first();
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
            });
        }
    },
    mreply: {
        help: "mreply %message_id% %message% (replies with mention)",
        run: function (client, message, [messageId, ...messageArray]) {
            message.channel.fetchMessages({limit: 1, around: messageId}).then(messages => {
                const replyMessage = messages.first();
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
            });
        }
    },
    emojify: {
        permissions: [],
        help: "emojify (with an image)",
        run: function (client, message) {
            //TODO - beauty and logging
            if (!message.attachments.array().length) {
                message.channel.sendMessage("Why u no image");
            } else {
                const image = message.attachments.array().pop();
                if (!image.height || !image.width) {
                    message.channel.sendMessage("Why u no proper image");
                } else {
                    base64.encode(image.url, {}, function (err, response) {
                        sharp(response).resize(32, 32).png().toBuffer(function (err, buffer, info) {
                            message.channel.sendFile(buffer, "image.png", "Big Emoji");
                        })
                        sharp(response).resize(24, 24).png().toBuffer(function (err, buffer, info) {
                            message.channel.sendFile(buffer, "image.png", "Small Emoji");
                        })
                    });

                }
            }
        }
    },
    del: {
        help: "del [%number%]",
        run: function (client, message, [number]) {
            if (number) {
                //TODO
            } else {
                message.delete().then(() => message.channel.fetchMessages({
                    limit: 5
                }).then(messages => {
                    const [msg, ...msgs] = messages.array().filter(msg => msg.author.id === client.user.id);
                    if (msg) {
                        msg.delete();
                    } else {
                        //TODO log?
                    }
                }));
            }
        }
    }
    //TODO list
    //logging to a channel
    //del [number]
    //delall
    //info
    //eval!!!
    //lennyface - node-json-db
    //
};

module.exports = commands;
