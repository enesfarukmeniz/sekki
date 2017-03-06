const Discord = require("discord.js");
const sharp = require("sharp");
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

client.login(config.token);

client.on('ready', () => {
    logger.generic(client, null, "on ready");
});

client.on('reconnecting', () => {
    logger.generic(client, null, "reconnecting");
});

client.on('disconnect', (event) => {
    logger.log(client, event, "disconnect", "closeEvent");
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
                    commands[command].run(client, message, args);
                } else {
                    message.channel.sendMessage(`I need ${missingPermissions.join(", ")} to **${command}**.`);
                    missingPermissions = {
                        missingPermissions: missingPermissions,
                        message: message
                    };
                    logger.log(client, missingPermissions, "missingPermissions", "missingPermissions")
                }
            });
        } else {
            commands[command].run(client, message, args);
        }
    } else {
        util.userNotifier(message.channel, `No command named **${command}**.`);
        logger.generic(client, message, "Command not found");
        message.delete();
    }
});

client.on('emojiCreate', (emoji) => {
    logger.log(client, event, "emojiCreate", "emoji");
});

client.on('emojiDelete', (emoji) => {
    logger.log(client, event, "emojiDelete", "emoji");
});

client.on('error', (error) => {
    logger.error(client, error, "error", "error");
});

client.on('warn', (warn) => {
    logger.error(client, warn, "warn", "warn");
});

client.on('guildBanAdd', (guild, user) => {
    logger.warn(client, {
        guild: guild,
        user: user
    }, "guildBanAdd", "guildBan");
});

client.on('guildBanRemove', (guild, user) => {
    logger.log(client, {
        guild: guild,
        user: user
    }, "guildBanRemove", "guildBan");
});

client.on('guildMemberAdd', (guildMember) => {
    logger.log(client, guildMember, "guildMemberAdd", "guildMember");
});

client.on('guildMemberRemove', (guildMember) => {
    logger.log(client, guildMember, "guildMemberRemove", "guildMember");
});

client.on('guildMemberUpdate', (guildMemberOld, guildMemberNew) => {
    logger.log(client, {
        guildMemberOld: guildMemberOld,
        guildMemberNew: guildMemberNew
    }, "guildMemberUpdate", "guildMembers");
});

client.on('guildUnavailable', (guild) => {
    logger.warn(client, guild, "guildUnavailable", "guild");
});

client.on('roleCreate', (role) => {
    logger.log(client, role, "roleCreate", "role");
});

client.on('roleDelete', (role) => {
    logger.log(client, role, "roleDelete", "role");
});

client.on('roleUpdate', (roleOld, roleNew) => {
    logger.log(client, {
        roleOld: roleOld,
        roleNew: roleNew
    }, "roleUpdate", "roles");
});

client.on('channelCreate', (channel) => {
    logger.log(client, role, "channelCreate", "channel");
});

client.on('channelRemove', (channel) => {
    logger.log(client, role, "channelRemove", "channel");
});

client.on('channelUpdate', (channelOld, channelNew) => {
    logger.log(client, {
        channelOld: channelOld,
        channelNew: channelNew
    }, "channelUpdate", "channels");
});

process.on('unhandledRejection', function (error, promise) {
    logger.error(client, {
        error: err,
        promise: promise
    }, "unhandledRejection", "unhandledRejection");
    //remove
    console.error('Unhandled rejection (promise: , reason: ', error, ').');
});