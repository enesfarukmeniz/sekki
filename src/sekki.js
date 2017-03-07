const Discord = require("discord.js");
const JsonDB = require('node-json-db');
const sharp = require("sharp");
const empty = require('is-empty');
const diff = require("deep-object-diff").diff;
const base64 = require("node-base64-image");
const commands = require("./commands.js");
const logger = require("./logger.js");
const util = require("./util.js");

try {
    config = require('./../config.json');
} catch (e) {
    console.log("Missing config.json file?");
    return;
}

const client = new Discord.Client({
    apiRequestMethod: "sequential",
    sync: true,
    restWsBridgeTimeout: 10000,
    disabledEvents: ["GUILD_MEMBERS_CHUNK", "MESSAGE_DELETE_BULK", "MESSAGE_REACTION_REMOVE",
        "MESSAGE_UPDATE", "MESSAGE_REACTION_ADD", "MESSAGE_DELETE", "RELATIONSHIP_REMOVE",
        "MESSAGE_REACTION_REMOVE_ALL", "USER_NOTE_UPDATE", "VOICE_STATE_UPDATE",
        "PRESENCE_UPDATE", "TYPING_START", "VOICE_SERVER_UPDATE", "RELATIONSHIP_ADD"
    ]
});

let database;

client.login(config.token);

client.on('ready', () => {
    if (util.getLogData(database, "/log/event/ready")) {
        logger.generic(client, null, "on ready");
    }
    database = new JsonDB("data/db", true, true);
});

client.on('reconnecting', () => {
    if (util.getLogData(database, "/log/event/reconnecting")) {
        logger.generic(client, null, "reconnecting");
    }
});

client.on('disconnect', (event) => {
    if (util.getLogData(database, "/log/event/disconnect")) {
        logger.warn(client, event, "disconnect", "closeEvent");
    }
});

client.on("message", (message) => {
    if (message.isMentioned(client.user.id) ||
        message.mentions.everyone ||
        (message.guild && message.mentions.roles.filter(role => message.guild.member(client.user.id).roles.has(role.id)).size > 0)) {
        logger.log(client, message, "mention", "mention");
    }
    if (message.author.id !== client.user.id) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.split(" ");
    const command = args.shift().slice(config.prefix.length);

    if (commands[command]) {
        if (commands[command].guild === true && !message.guild) {
            util.userNotifier(message.channel, `Lol **${command}** is guild command.`);
            message.delete();
            return;
        }
        const permissions = commands[command].permissions;
        if (permissions && permissions.length > 0) {
            message.guild.fetchMember(client.user.id).then(member => {
                let missingPermissions = member.missingPermissions(permissions);
                if (missingPermissions.length === 0) {
                    commands[command].run(database, client, message, args);
                } else {
                    message.delete();
                    util.userNotifier(message.channel, `I need ${missingPermissions.join(", ")} to **${command}**.`);
                    missingPermissions = {
                        missingPermissions: missingPermissions,
                        message: message
                    };
                    logger.warn(client, missingPermissions, "missingPermissions", "missingPermissions")
                }
            });
        } else {
            commands[command].run(database, client, message, args);
        }
    } else {
        util.userNotifier(message.channel, `No command named **${command}**.`);
        logger.generic(client, message, "Command not found");
        message.delete();
    }
});

client.on('emojiCreate', (emoji) => {
    if (util.getLogData(database, "/log/event/emojiCreate") && util.getLogData(database, "/log/guild/" + emoji.guild.id)) {
        logger.log(client, emoji, "emojiCreate", "emoji");
    }
});

client.on('emojiDelete', (emoji) => {
    if (util.getLogData(database, "/log/event/emojiDelete") && util.getLogData(database, "/log/guild/" + emoji.guild.id)) {
        logger.log(client, emoji, "emojiDelete", "emoji");
    }
});

client.on('error', (error) => {
    if (util.getLogData(database, "/log/event/error")) {
        logger.error(client, error, "error", "error");
    }
});

client.on('warn', (warn) => {
    if (util.getLogData(database, "/log/event/warn")) {
        logger.warn(client, warn, "warn", "warn");
    }
});

client.on('guildBanAdd', (guild, user) => {
    if (util.getLogData(database, "/log/event/guildBanAdd") && util.getLogData(database, "/log/guild/" + guild.id)) {
        logger.warn(client, {
            guild: guild,
            user: user
        }, "guildBanAdd", "guildBan");
    }
});

client.on('guildBanRemove', (guild, user) => {
    if (util.getLogData(database, "/log/event/guildBanRemove") && util.getLogData(database, "/log/guild/" + guild.id)) {
        logger.log(client, {
            guild: guild,
            user: user
        }, "guildBanRemove", "guildBan");
    }
});

client.on('guildMemberAdd', (guildMember) => {
    if (util.getLogData(database, "/log/event/guildMemberAdd") && util.getLogData(database, "/log/guild/" + guildMember.guild.id)) {
        logger.log(client, guildMember, "guildMemberAdd", "guildMember");
    }
});

client.on('guildMemberRemove', (guildMember) => {
    if (util.getLogData(database, "/log/event/guildMemberRemove") && util.getLogData(database, "/log/guild/" + guildMember.guild.id)) {
        logger.log(client, guildMember, "guildMemberRemove", "guildMember");
    }
});

client.on('guildMemberUpdate', (guildMemberOld, guildMemberNew) => {
    if (util.getLogData(database, "/log/event/guildMemberUpdate") && util.getLogData(database, "/log/guild/" + guildMemberOld.guild.id)) {
        if (!empty(diff(guildMemberNew, guildMemberNew))) {
            logger.log(client, {
                guildMemberOld: guildMemberOld,
                guildMemberNew: guildMemberNew
            }, "guildMemberUpdate", "guildMembers");
        }
    }
});

client.on('guildUnavailable', (guild) => {
    if (util.getLogData(database, "/log/event/guildUnavailable") && util.getLogData(database, "/log/guild/" + guild.id)) {
        logger.warn(client, guild, "guildUnavailable", "guild");
    }
});

client.on('roleCreate', (role) => {
    if (util.getLogData(database, "/log/event/roleCreate") && util.getLogData(database, "/log/guild/" + role.guild.id)) {
        logger.log(client, role, "roleCreate", "role");
    }
});

client.on('roleDelete', (role) => {
    if (util.getLogData(database, "/log/event/roleDelete") && util.getLogData(database, "/log/guild/" + role.guild.id)) {
        logger.log(client, role, "roleDelete", "role");
    }
});

client.on('roleUpdate', (roleOld, roleNew) => {
    if (util.getLogData(database, "/log/event/roleUpdate") && util.getLogData(database, "/log/guild/" + roleOld.guild.id)) {
        if (!empty(diff(roleOld, roleNew))) {
            logger.log(client, {
                roleOld: roleOld,
                roleNew: roleNew
            }, "roleUpdate", "roles");
        }
    }
});

client.on('channelCreate', (channel) => {
    if (util.getLogData(database, "/log/event/channelCreate") && util.getLogData(database, "/log/guild/" + channel.guild.id)) {
        logger.log(client, role, "channelCreate", "channel");
    }
});

client.on('channelRemove', (channel) => {
    if (util.getLogData(database, "/log/event/channelRemove") && util.getLogData(database, "/log/guild/" + channel.guild.id)) {
        logger.log(client, role, "channelRemove", "channel");
    }
});

client.on('channelUpdate', (channelOld, channelNew) => {
    if (util.getLogData(database, "/log/event/channelUpdate") && util.getLogData(database, "/log/guild/" + channelOld.guild.id)) {
        if (!empty(diff(channelOld, channelNew))) {
            logger.log(client, {
                channelOld: channelOld,
                channelNew: channelNew
            }, "channelUpdate", "channels");
        }
    }
});

process.on('unhandledRejection', function (error, promise) {
    if (util.getLogData(database, "/log/event/unhandledRejection")) {
        logger.error(client, {
            error: error,
            promise: promise
        }, "unhandledRejection", "unhandledRejection");
    }
    //remove
    console.error('Unhandled rejection (promise: , reason: ', error, ').');
});