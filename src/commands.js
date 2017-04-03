const sharp = require('sharp');
const base64 = require('node-base64-image');
const empty = require('is-empty');
const moment = require('moment');
require("moment-duration-format");
const request = require('request');
const cheerio = require('cheerio');
const beautify = require('js-beautify').js_beautify

const config = require('./../config.json');
const logger = require("./logger.js");
const util = require("./util.js");

const commands = {
    embedtest: {
        run: function (client, msg, params) {
            let embed = {
                color: 3447003,
                author: {
                    name: msg.author.username,
                    icon_url: msg.author.avatarURL // eslint-disable-line camelcase
                },
                title: 'THIS IS A TITLE',
                url: 'http://example.com', // The url for the title.
                description: 'This is a test embed to showcase what they look like and what they can do.\n[Code here](https://github.com/vzwGrey/discord-selfbot/blob/master/commands/embed.js)',
                fields: [
                    {
                        name: 'Fields',
                        value: 'They can have different fields with small headlines.'
                    },
                    {
                        name: 'Masked links',
                        value: 'You can put [masked](https://github.com/vzwGrey/discord-selfbot/blob/master/commands/embed.js) links inside of rich embeds.'
                    },
                    {
                        name: 'Markdown',
                        value: 'You can put all the *usual* **__Markdown__** inside of them.'
                    },
                    {
                        name: 'Inline fields',
                        value: 'You can also have fields inline with eachother using the `inline` property',
                        inline: true
                    },
                    {
                        name: 'Images & thumbnails',
                        value: 'You can also embed images, and use little thumbnails!',
                        inline: true
                    }
                ],
                /* thumbnail: {
                 url: 'http://i.imgur.com/uaUxZtz.jpg'
                 } */
                image: {
                    url: 'http://i.imgur.com/uaUxZtz.jpg'
                },
                timestamp: new Date(),
                footer: {
                    icon_url: msg.author.avatarURL, // eslint-disable-line camelcase
                    text: '©vzwGrey'
                }
            };

            msg.channel.sendMessage('',
                {embed});
        }
    },
    help: {
        help: "help [%command%](obviously lol)",
        description: "Helps about commands lol",
        run: function (client, message, [command]) {
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
        run: function (client, message) {
            message.edit("ping...")
                .then(msg => {
                    msg.edit(`Pong! ${msg.editedTimestamp - message.createdTimestamp}ms`);
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
    info: {
        help: "info",
        description: "Info about Sekki",
        run: function (client, message) {
            const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
            let info = "```asciidoc\n= STATISTICS =\n" +
                "• Mem Usage  :: " + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB\n" +
                "• Uptime     :: " + duration + "\n" +
                "• Users      :: " + client.users.size.toLocaleString() + "\n" +
                "• Servers    :: " + client.guilds.size.toLocaleString() + "\n" +
                "• Channels   :: " + client.channels.size.toLocaleString() + "```";
            util.userNotifierPreMessage(message, info, 10);
        }
    },
    eval: {
        help: "eval %...code%",
        description: "evil",
        run: function (client, message, code) {
            let input = code.join(' ');

            //TODO message length
            try {
                let output = eval(input);
                if (output === null) {
                    output = "null";
                }
                if (typeof output != 'string') {
                    output = require('util').inspect(output);
                }
                output = output.replace(client.token,
                    '*insert token*').replace(client.user.email,
                    '*insert mail*');
                message.edit("**Code**\n```js\n" + beautify(input,
                        {indent_size: 2}) + "```\n**Output**\n```js\n" + output + "```");
            } catch (error) {
                message.edit("**Code**\n```js\n" + beautify(input,
                        {indent_size: 2}) + "```\n**Error**\n```js\n" + error + "```");
            }
        }
    },
    stats: {
        help: "stats",
        description: "Steam stats from ",
        statuses: {
            beaten: {
                title: "Beaten",
                selector: "beaten"
            },
            blacklisted: {
                title: "Blacklisted",
                selector: "blacklisted"
            },
            unplayed: {
                title: "Unplayed",
                selector: "unplayed"
            },
            playing: {
                title: "Playing",
                selector: "disabled"
            },
            played: {
                title: "Played (probably card farmed)",
            }
        },
        run: function (client, message, [parameter]) {
            const statuses = commands.stats.statuses;

            if (!empty(parameter)) {
                if (empty(statuses[parameter])) {
                    util.userNotifierPreMessage(message, `No status: ${parameter}`);
                    return;
                } else if (!statuses[parameter].selector) {
                    util.userNotifierPreMessage(message, `No selector for: ${parameter}. todo?`);
                    return;
                }
            }
            const steamId = util.getData("/config/steamId");
            if (steamId) {
                request("http://steamcompletionist.net/" + steamId + "/", function (error, response, body) {
                    if (!error) {
                        const $ = cheerio.load(body);
                        if (empty(parameter)) {
                            let subTotal = 0;
                            const total = $(".list_boxes > .list_box").length;
                            let info = "```asciidoc\n= GAME STATS =\n";
                            info += `• Total  :: ${total} \n\n`;

                            for (index of Object.keys(statuses)) {
                                if (statuses[index].selector) {
                                    const length = $(".list_boxes > .list_box." + statuses[index].selector).length;
                                    subTotal += length;
                                    info += `• ${statuses[index]["title"]}  :: ${length} \n`;
                                } else {
                                    //special case for just "played" - bad hack
                                    info += `• ${statuses[index]["title"]}  :: ${total - subTotal} \n`;
                                }
                            }

                            info += "```";
                            message.edit(info);
                        } else {
                            let info = "```asciidoc\n= " + statuses[parameter]["title"].toUpperCase() + " =\n";
                            $(".list_boxes > .list_box." + statuses[parameter].selector).each(function (index, el) {
                                const img = $("img", el);
                                let minutes = img.attr("data-minutestotal");
                                const hours = Math.floor(minutes / 60);
                                minutes = minutes % 60;
                                info += "• " + (index + 1) + " - " + img.attr("alt") + " :: " + hours + "h " + minutes + "m\n";
                            });
                            info += "```";
                            //TODO message length
                            message.edit(info);
                        }
                    } else {
                        util.userNotifierPreMessage(message, `Request error: ${error}`);
                        logger.error({event: "requestStats"}, client, error, "requestStats", "error");
                    }
                });
            } else {
                util.userNotifierPreMessage(message, `/config/steamId not found`);
            }
        }
    },
    embed: {
        help: "embed %message%",
        description: "Sends embed message because why not",
        run: function (client, message, messageArray) {
            message.edit("", {
                embed: {
                    color: 0xFFFFFF,
                    author: {
                        name: message.author.username,
                        icon_url: message.author.avatarURL
                    },
                    description: messageArray.join(" "),
                    timestamp: message.createdAt,
                    footer: {
                        text: message.guild ? (`${message.guild.name} : #${message.channel.name}`) : "",
                        icon_url: message.guild ? message.guild.iconURL : ""
                    }
                }
            });
        }
    },
    embedfake: {
        help: "embedfake %authorId% %message%",
        description: "Sends a fake embed message from user %authorId% because why not",
        run: function (client, message, [authorId, ...messageArray]) {
            message.edit("", {
                embed: {
                    color: 0xFFFFFF,
                    author: {
                        name: client.users.get(authorId).username,
                        icon_url: client.users.get(authorId).avatarURL
                    },
                    description: messageArray.join(" ")
                }
            });
        }
    },
    reply: {
        help: "reply %message_id% %message%",
        description: "Replies a message with id",
        run: function (client, message, [messageId, ...messageArray]) {
            message.channel.sendMessage(messageArray.join(" "));
            message.channel.fetchMessages({
                limit: 1,
                around: messageId
            }).then(messages => {
                const replyMessage = messages.first();
                if (replyMessage) {
                    message.edit("", {
                        embed: {
                            color: 0xFFFFFF,
                            author: {
                                name: replyMessage.author.username,
                                icon_url: replyMessage.author.avatarURL
                            },
                            description: replyMessage.content,
                            timestamp: replyMessage.createdAt
                        }
                    });
                } else {
                    util.userNotifierPreMessage(message, `Message with id ${messageId} not found`);
                }
            });
        }
    },
    mreply: {
        help: "mreply %message_id% %message%",
        description: "Replies a message with id and mentions message owner",
        run: function (client, message, [messageId, ...messageArray]) {
            message.channel.fetchMessages({
                limit: 1,
                around: messageId
            }).then(messages => {
                const replyMessage = messages.first();
                message.channel.sendMessage(replyMessage.author + " " + messageArray.join(" "));
                if (replyMessage) {
                    message.edit("", {
                        embed: {
                            color: 0xFFFFFF,
                            author: {
                                name: replyMessage.author.username,
                                icon_url: replyMessage.author.avatarURL
                            },
                            description: replyMessage.content,
                            timestamp: replyMessage.createdAt
                        }
                    });
                } else {
                    util.userNotifierPreMessage(message, `Message with id ${messageId} not found`);
                }
            });
        }
    },
    emojify: {
        help: "emojify [%imageurl%]",
        description: "Shows how image looks like if becomes emoji. Use command with image or url",
        run: function (client, message, [url]) {
            if (url) {
                base64.encode(url, {}, function (error, response) {
                    if (!error) {
                        sharp(response).resize(32, 32).png().toBuffer(function (err, buffer) {
                            if (!err) {
                                message.channel.sendFile(buffer, "image.png", "Big Emoji");
                            } else {
                                logger.imgError({
                                    event: "image",
                                    channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                                    guild: message.channel.guild ? message.channel.guild.id : false
                                }, client, message, err, "sharp", false);
                                util.userNotifier(message.channel, "Couldn't convert image");
                            }
                        });
                        sharp(response).resize(22, 22).png().toBuffer(function (err, buffer) {
                            if (!err) {
                                message.channel.sendFile(buffer, "image.png", "Small Emoji");
                            } else {
                                logger.imgError({
                                    event: "image",
                                    channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                                    guild: message.channel.guild ? message.channel.guild.id : false
                                }, client, message, err, "sharp", false);
                                util.userNotifier(message.channel, "Couldn't convert image");
                            }
                        });
                    } else {
                        logger.imgError({
                            event: "image",
                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                            guild: message.channel.guild ? message.channel.guild.id : false
                        }, client, message, error, "base64", false);
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
                        logger.imgError({
                            event: "image",
                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                            guild: message.channel.guild ? message.channel.guild.id : false
                        }, client, message, null, "attachment", true);
                    } else {
                        base64.encode(image.url, {}, function (error, response) {
                            if (!error) {
                                sharp(response).resize(32, 32).png().toBuffer(function (err, buffer) {
                                    if (!err) {
                                        message.channel.sendFile(buffer, "image.png", "Big Emoji");
                                    } else {
                                        logger.imgError({
                                            event: "image",
                                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                                            guild: message.channel.guild ? message.channel.guild.id : false
                                        }, client, message, err, "sharp", true);
                                        util.userNotifier(message.channel, "Couldn't convert image");
                                    }
                                });
                                sharp(response).resize(22, 22).png().toBuffer(function (err, buffer) {
                                    if (!err) {
                                        message.channel.sendFile(buffer, "image.png", "Small Emoji");
                                    } else {
                                        logger.imgError({
                                            event: "image",
                                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                                            guild: message.channel.guild ? message.channel.guild.id : false
                                        }, client, message, err, "sharp", true);
                                        util.userNotifier(message.channel, "Couldn't convert image");
                                    }
                                });
                            } else {
                                logger.imgError({
                                    event: "image",
                                    channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                                    guild: message.channel.guild ? message.channel.guild.id : false
                                }, client, message, error, "base64", true);
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
        run: function (client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.filterArray(msg => msg.author.id === client.user.id).slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        logger.log({
                            event: "messageDelete",
                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                            guild: message.channel.guild ? message.channel.guild.id : false
                        }, client, msg, "messageDelete", "message");
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
        run: function (client, message, [number = 1]) {
            message.delete().then(() => message.channel.fetchMessages({
                limit: 100
            }).then(messages => {
                let msgs = messages.array().slice(0, number);
                if (msgs.length) {
                    msgs.forEach(msg => {
                        logger.log({
                            event: "messageDelete",
                            channel: message.channel.guild ? message.channel.guild.id : message.channel.id,
                            guild: message.channel.guild ? message.channel.guild.id : false
                        }, client, msg, "messageDelete", "message");
                        msg.delete();
                    });
                }
            }));
        }
    },
    save: {
        help: "save %messageid%",
        description: "Save message with %messageid% to configured saveChannel",
        run: function (client, message, [messageId, ..._]) {
            message.channel.fetchMessages({
                limit: 1,
                around: messageId
            }).then(messages => {
                const saveMessage = messages.first();
                if (saveMessage) {
                    const saveChannelId = util.getData("/config/saveChannel");
                    if (saveChannelId) {
                        const saveChannel = client.channels.filter(channel => saveChannelId == channel.id).first();
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
                            message.delete();
                        } else {
                            logger.generic({}, client, message, "Save channel " + saveChannelId + " does not exist");
                            util.userNotifierPreMessage(message, "Save channel " + saveChannelId + " does not exist");
                        }
                    } else {
                        logger.generic({}, client, message, "Save channel not configured");
                        util.userNotifierPreMessage(message, "Save channel not configured");
                    }
                } else {
                    logger.generic({}, client, message, "Message with id " + messageId + " not found");
                    util.userNotifierPreMessage(message, "Message not found");
                }
            });
        }
    },
    set: {
        help: "set %value% %...key%",
        description: "Sets a value for db for specific key",
        run: function (client, message, [value, ...keys]) {
            message.delete();

            let masterKey = "";
            for (key of keys) {
                masterKey += ("/" + key);
            }

            util.setData(masterKey, value);
            logger.generic({event: "dbChange"}, client, message, `Value for ${masterKey} changed to ${value}`);
        }
    },
    get: {
        help: "get %...key%",
        description: "Gets a value from db for specific key",
        run: function (client, message, keys) {
            message.delete();

            let masterKey = "";
            for (key of keys) {
                masterKey += ("/" + key);
            }

            util.getData(masterKey, valueMap[value]);
        }
    },
    log: {
        help: "log %value% %...key% ",
        description: "Sets logging options for key %key% to value %value% ",
        run: function (client, message, [value, ...keys]) {
            keys.unshift("log");
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
            if (valueMap[value] === false || valueMap[value] === true) {
                commands.set.run(client, message, valueMap[value], keys)
            } else {
                util.userNotifierPreMessage(message, "No value found for " + value);
            }
        }
    }
    //TODO img? lenny? impossibrus?
};

module.exports = commands;
