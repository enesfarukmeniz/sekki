const logger = require("./logger.js");
const sharp = require('sharp');
const base64 = require('node-base64-image');
const config = require('./../config.json');

const commands = {
    help: {
        help: "help [%command%](obviously lol)",
        description: "Helps about commands lol",
        run: function (client, message, [command]) {
            message.delete();
            if (command) {
                if (!commands[command]) {
                    message.channel.sendMessage(`**${command}** is not valid command.`);
                } else {
                    message.channel.sendMessage(`\`\`\`${command} command usage: ${config.prefix}${commands[command].help}\nIt does: ${commands[command].description}\`\`\``);
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
                message.channel.sendMessage(helpMessage);
            }
        }
    },
    ping: {
        help: "ping",
        description: "ping pong",
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
        description: "Returns github address of project",
        run: function (client, message) {
            message.edit("https://github.com/enesfarukmeniz/sekki");
        }
    },
    reply: {
        help: "reply %message_id% %message%",
        description: "Replies a message with id",
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
        help: "mreply %message_id% %message%",
        description: "Replies a message with id and mentions message owner",
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
        help: "emojify",
        description: "Shows how image looks like if becomes emoji. Use command with image",
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
                        });
                        sharp(response).resize(22, 22).png().toBuffer(function (err, buffer, info) {
                            message.channel.sendFile(buffer, "image.png", "Small Emoji");
                        });
                    });

                }
            }
        }
    },
    del: {
        help: "del [%number%]",
        description: "Deletes user's own messages. Default %number% value is 1, max is 100. Not guaranteed to delete %number% of messages cause of discord api limitations",
        run: function (client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.filterArray(msg => msg.author.id === client.user.id).slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        //TODO log
                        msg.delete();
                    });
                } else {
                    //TODO log?
                }
            }));
        }
    },
    delall: {
        help: "delall [%number%]",
        permissions: ["MANAGE_MESSAGES"],
        description: "Deletes all users' messages. Default %number% value is 1, max 100",
        run: function (client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.array().slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        //TODO log
                        msg.delete();
                    });
                } else {
                    //TODO log?
                }
            }));
        }
    },
    save: {
        help: "save %messageid%",
        description: "Save message with %messageid% to configured saveChannel",
        run: function (client, message, [messageId, ..._]) {
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
                    //TODO log no saveChannel
                }
            });
        }
    }
    //TODO list
    //logging to a channel
    //save message (to a channel?)
    //info
    //eval!!!
    //lenny face - node-json-db
    //
};

module.exports = commands;
