const Discord = require("discord.js");
const sharp = require("sharp");
const empty = require('is-empty');
const base64 = require("node-base64-image");
const diff = require("deep-object-diff").diff;

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
    disabledEvents: ["GUILD_MEMBERS_CHUNK",
                     "MESSAGE_DELETE_BULK",
                     "MESSAGE_REACTION_REMOVE",
                     "MESSAGE_UPDATE",
                     "MESSAGE_REACTION_ADD",
                     "MESSAGE_DELETE",
                     "RELATIONSHIP_REMOVE",
                     "MESSAGE_REACTION_REMOVE_ALL",
                     "USER_NOTE_UPDATE",
                     "VOICE_STATE_UPDATE",
                     "PRESENCE_UPDATE",
                     "TYPING_START",
                     "VOICE_SERVER_UPDATE",
                     "RELATIONSHIP_ADD"
    ]
});

client.login(config.token);

client.on("message", (message) => {
    if (message.isMentioned(client.user.id) ||
        message.mentions.everyone ||
        (message.guild && message.mentions.roles.filter(role => message.guild.member(client.user.id).roles.has(role.id)).size > 0)) {
        logger.log({event: "mention"}, client, message, "mention", "mention");
    }
    if (message.author.id !== client.user.id) {
        return;
    }

    if (!message.content.startsWith(config.prefix)) {
        return;
    }

    const args = message.content.split(" ");
    const command = args.shift().slice(config.prefix.length);

    if (commands[command]) {
        if (commands[command].guild === true && !message.guild) {
            util.userNotifierPreMessage(message, `Lol **${command}** is guild command.`);
            return;
        }
        const permissions = commands[command].permissions;
        if (permissions && permissions.length > 0) {
            message.guild.fetchMember(client.user.id).then(member => {
                let missingPermissions = member.missingPermissions(permissions);
                if (missingPermissions.length === 0) {
                    commands[command].run(client, message, args);
                } else {
                    missingPermissions = {
                        missingPermissions: missingPermissions,
                        message: message
                    };
                    logger.warn({event: "missingPermissions"}, client, missingPermissions, "missingPermissions", "missingPermissions");
                    util.userNotifierPreMessage(message, `I need ${missingPermissions.missingPermissions.join(", ")} to **${command}**.`);
                }
            });
        } else {
            commands[command].run(client, message, args);
        }
    } else {
        util.userNotifierPreMessage(message, `No command named **${command}**.`);
        logger.generic({}, client, message, "Command not found");
    }
});

client.on('ready', () => {
    logger.generic({event: "ready"}, client, null, "on ready");
    if (util.getData("/welcome", true)) {
        //TODO welcome
        util.setData("/welcome", false);
    }
});

client.on('reconnecting', () => {
    logger.generic({event: "reconnecting"}, client, null, "reconnecting");
});

client.on('disconnect', (event) => {
    logger.warn({event: "disconnect"}, client, event, "disconnect", "closeEvent");
});

client.on('emojiCreate', (emoji) => {
    logger.log({
        event: "emojiCreate",
        guild: emoji.guild.id
    }, client, emoji, "emojiCreate", "emoji");
});

client.on('emojiDelete', (emoji) => {
    logger.log({
        event: "emojiDelete",
        guild: emoji.guild.id
    }, client, emoji, "emojiDelete", "emoji");
});

client.on('emojiUpdate', (emojiOld, emojiNew) => {
    if (!empty(diff(emojiOld, emojiNew))) {
        logger.log({
            event: "emojiUpdate",
            guild: emojiOld.guild.id
        }, client, {
            emojiOld: emojiOld,
            emojiNew: emojiNew
        }, "emojiUpdate", "emojis");
    }
});

client.on('error', (error) => {
    logger.error({event: "error"}, client, error, "error", "error");
});

client.on('warn', (warn) => {
    logger.warn({event: "warn"}, client, warn, "warn", "warn");
});

client.on('guildBanAdd', (guild, user) => {
    logger.warn({
        event: "guildBanAdd",
        guild: guild.id
    }, client, {
        guild: guild,
        user: user
    }, "guildBanAdd", "guildBan");
});

client.on('guildBanRemove', (guild, user) => {
    logger.log({
        event: "guildBanRemove",
        guild: guild.id
    }, client, {
        guild: guild,
        user: user
    }, "guildBanRemove", "guildBan");
});

client.on('guildMemberAdd', (guildMember) => {
    logger.log({
        event: "guildMemberAdd",
        guild: guildMember.guild.id
    }, client, guildMember, "guildMemberAdd", "guildMember");
});

client.on('guildMemberRemove', (guildMember) => {
    logger.log({
        event: "guildMemberRemove",
        guild: guildMember.guild.id
    }, client, guildMember, "guildMemberRemove", "guildMember");
});

client.on('guildMemberUpdate', (guildMemberOld, guildMemberNew) => {
    if (!empty(diff(guildMemberOld, guildMemberNew))) {
        logger.log({
            event: "guildMemberUpdate",
            guild: guildMemberOld.guild.id
        }, client, {
            guildMemberOld: guildMemberOld,
            guildMemberNew: guildMemberNew
        }, "guildMemberUpdate", "guildMembers");
    }
});

client.on('guildUnavailable', (guild) => {
    logger.warn({event: "guildUnavailable"}, client, guild, "guildUnavailable", "guild");
});

client.on('roleCreate', (role) => {
    logger.log({
        event: "roleCreate",
        guild: role.guild.id
    }, client, role, "roleCreate", "role");
});

client.on('roleDelete', (role) => {
    logger.log({
        event: "roleDelete",
        guild: role.guild.id
    }, client, role, "roleDelete", "role");
});

client.on('roleUpdate', (roleOld, roleNew) => {
    if (!empty(diff(roleOld, roleNew))) {
        logger.log({
            event: "roleUpdate",
            guild: roleOld.guild.id
        }, client, {
            roleOld: roleOld,
            roleNew: roleNew
        }, "roleUpdate", "roles");
    }
});

client.on('channelCreate', (channel) => {
    logger.log({
        event: "channelCreate",
        guild: channel.guild ? channel.guild.id : null
    }, client, channel, "channelCreate", "channel");
});

client.on('channelDelete',
    (channel) => {
    logger.log({
            event: "channelDelete",
            guild: channel.guild ? channel.guild.id : null
        },
        client,
        channel,
        "channelDelete",
        "channel");
});

client.on('channelUpdate', (channelOld, channelNew) => {
    if (!empty(diff(channelOld, channelNew))) {
        logger.log({
            event: "channelUpdate",
            guild: channelOld.guild ? channelOld.guild.id : null
        }, client, {
            channelOld: channelOld,
            channelNew: channelNew
        }, "channelUpdate", "channels");
    }
});

process.on('unhandledRejection', function (error, promise) {
    logger.error({event: "unhandledRejection"}, client, {
        error: error,
        promise: promise
    }, "unhandledRejection", "unhandledRejection");
});
