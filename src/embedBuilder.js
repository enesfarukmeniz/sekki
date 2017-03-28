const detailedDiff = require("deep-object-diff").detailedDiff;
const empty = require('is-empty');

const embedBuilder = {
    levels: {
        info: 0x82bbed,
        warning: 0xe89714,
        error: 0xe00d0d,
    },
    colorWrapper: function (data, level) {
        data.embed.color = embedBuilder.levels[level];
        return data;
    },
    message: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.author.username,
                    icon_url: data.author.avatarURL
                },
                description: data.content,
                timestamp: data.createdAt,
                footer: {
                    text: data.guild ? (`${data.guild.name} : #${data.channel.name}`) : "Private",
                    icon_url: data.guild ? data.guild.iconURL : ""
                }
            },
            message: event
        }, level);
    },
    empty: function (level) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: "Generic Log",
                timestamp: new Date(),
            },
            message: ""
        }, level);
    },
    emoji: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.guild.name,
                    icon_url: data.guild.iconURL
                },
                description: data.name + " - " + data,
                timestamp: data.createdAt,
                footer: {
                    text: data.guild.name,
                    icon_url: data.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    emojis: function (data, level, event) {
        let diff = detailedDiff(data.emojiOld, data.emojiNew);

        const helpers = {};

        for (stat of ["added", "deleted", "updated"]) {
            if (empty(diff[stat])) {
                delete diff[stat];
            } else {
                for (key of []) {
                    if (diff[stat][key]) {
                        for (index of Object.keys(diff[stat][key])) {
                            diff[stat][key][index] = helpers[key](data.emojiOld, diff[stat][key][index])
                        }
                    }
                }
            }
        }

        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "",
                },
                description: data.emojiOld.name + " & " + data.emojiOld + " - " + data.emojiNew.name + " & " + data.emojiNew + "```json\n" + JSON.stringify(diff, null, 2) + "```",
                timestamp: new Date(),
                footer: {
                    text: data.emojiOld.guild.name,
                    icon_url: data.emojiOld.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    closeEvent: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: `Code: ${data.code}\nDescription: ${data.reason}\nClean Exit: ${data.wasClean}`,
                timestamp: new Date()
            },
            message: event
        }, level);
    },
    mention: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.author.username,
                    icon_url: data.author.avatarURL
                },
                description: data.content,
                timestamp: data.createdAt,
                footer: {
                    text: data.guild ? (`${data.guild.name} : #${data.channel.name}`) : "Private",
                    icon_url: data.guild ? data.guild.iconURL : ""
                }
            },
            message: event
        }, level);
    },
    missingPermissions: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.message.author.username,
                    icon_url: data.message.author.avatarURL
                },
                description: `${data.message.content}\nMissing Permissions: ${data.missingPermissions.join(", ")}`,
                timestamp: data.message.createdAt,
                footer: {
                    text: `${data.message.guild.name} : #${data.message.channel.name}`,
                    icon_url: data.message.guild ? data.message.guild.iconURL : ""
                }
            },
            message: event
        }, level);
    },
    error: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: "```json\n" + JSON.stringify(data, null, 2) + "```",
                timestamp: new Date()
            },
            message: event
        }, level);
    },
    warn: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: data,
                timestamp: new Date(),
            },
            message: event
        }, level);
    },
    guildBan: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.user.username,
                    icon_url: data.user.avatarURL
                },
                description: "",
                timestamp: new Date(),
                footer: {
                    text: data.guild.name,
                    icon_url: data.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    guildMember: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.user.username,
                    icon_url: data.user.avatarURL
                },
                description: "",
                timestamp: new Date(),
                footer: {
                    text: data.guild.name,
                    icon_url: data.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    guildMembers: function (data, level, event) {
        let diff = detailedDiff(data.guildMemberOld, data.guildMemberNew);

        const helpers = {
            _roles: function (guild, roleId) {
                return guild.roles.get(roleId).name;
            }
        };

        for (stat of ["added", "deleted", "updated"]) {
            if (empty(diff[stat])) {
                delete diff[stat];
            } else {
                for (key of ["_roles"]) {
                    if (diff[stat][key]) {
                        for (index of Object.keys(diff[stat][key])) {
                            diff[stat][key][index] = helpers[key](data.guildMemberOld.guild, diff[stat][key][index])
                        }
                    }
                }
            }
        }

        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.guildMemberOld.user.username,
                    icon_url: data.guildMemberOld.user.avatarURL
                },
                description: "```json\n" + JSON.stringify(diff, null, 2) + "```",
                timestamp: new Date(),
                footer: {
                    text: data.guildMemberOld.guild.name,
                    icon_url: data.guildMemberOld.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    guild: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.name,
                },
                description: "Guild ID: " + data.id,
                timestamp: new Date(),
                footer: {
                    text: data.name,
                    icon_url: data.iconURL
                }
            },
            message: event
        }, level);
    },
    role: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.name,
                },
                description: "Members:" + data.members.array().join(", "),
                timestamp: data.createdAt,
                footer: {
                    text: data.guild.name,
                    icon_url: data.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    roles: function (data, level, event) {
        let diff = detailedDiff(data.roleOld, data.roleNew);

        const helpers = {};

        for (stat of ["added", "deleted", "updated"]) {
            if (empty(diff[stat])) {
                delete diff[stat];
            } else {
                for (key of []) {
                    if (diff[stat][key]) {
                        for (index of Object.keys(diff[stat][key])) {
                            diff[stat][key][index] = helpers[key](data.roleOld, diff[stat][key][index])
                        }
                    }
                }
            }
        }

        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.roleOld.name + " - " + data.roleNew.name,
                },
                description: "```json\n" + JSON.stringify(diff, null, 2) + "```",
                timestamp: new Date(),
                footer: {
                    text: data.roleOld.guild.name,
                    icon_url: data.roleOld.guild.iconURL
                }
            },
            message: event
        }, level);
    },
    channel: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.name,
                },
                description: "Type:" + data.type,
                timestamp: data.createdAt,
                footer: {
                    text: data.guild ? data.guild.name : "",
                    icon_url: data.guild ? data.guild.iconURL : ""
                }
            },
            message: event
        }, level);
    },
    channels: function (data, level, event) {
        let diff = detailedDiff(data.channelOld, data.channelNew);

        const helpers = {};

        for (stat of ["added", "deleted", "updated"]) {
            if (empty(diff[stat])) {
                delete diff[stat];
            } else {
                for (key of []) {
                    if (diff[stat][key]) {
                        for (index of Object.keys(diff[stat][key])) {
                            diff[stat][key][index] = helpers[key](data.channelOld, diff[stat][key][index])
                        }
                    }
                }
            }
        }

        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: data.channelOld.name + " - " + data.channelNew.name,
                },
                description: "```json\n" + JSON.stringify(diff, null, 2) + "```",
                timestamp: new Date(),
                footer: {
                    text: data.channelOld.guild ? data.channelOld.guild.name : "",
                    icon_url: data.channelOld.guild ? data.channelOld.guild.iconURL : ""
                }
            },
            message: event
        }, level);
    },
    unhandledRejection: function (data, level, event) {
        let error = {};

        try {
            error = {
                method: data.error.response.req.method,
                url: data.error.response.req.url,
                status: data.error.response.status,
                text: data.error.response.text
            };
        } catch (e) {
            error = {data: data};
        }

        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: "```json\n" + JSON.stringify(error, null, 2) + "```",
                timestamp: new Date(),
            },
            message: event
        }, level);
    },
    sharp: function (data, level, error, embedImage) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: `Message: ${data.content}\nEmbed: ${embedImage}\nError: ${error}`,
                timestamp: new Date(),
            },
            message: event
        }, level);
    },
    base64: function (data, level, error, embedImage) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: `Message: ${data.content}\nEmbed: ${embedImage}\nError: ` + "```json\n" + JSON.stringify(error, null, 2) + "```",
                timestamp: new Date()
            },
            message: event
        }, level);
    },
    attachment: function (data, level, error, embedImage) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                description: `Message: ${data.content}\nEmbed: ${embedImage}\nError: ${error}`,
                timestamp: new Date(),
            },
            message: event
        }, level);
    }
};

module.exports = embedBuilder;