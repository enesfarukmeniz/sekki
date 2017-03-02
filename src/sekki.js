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

const client = new Discord.Client();
client.login(config.token);

client.on('ready', () => {
});

client.on('disconnect', () => {
});

client.on("message", (message) => {
    if (message.isMentioned(client.user.id) ||
        message.mentions.everyone ||
        (message.guild && message.mentions.roles.filter(role => message.guild.member(client.user.id).roles.has(role.id)).size > 0)) {
        logger.mention(client, message);
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
                const missingPermissions = member.missingPermissions(permissions)
                if (missingPermissions.length === 0) {
                    commands[command].run(client, message, args);
                } else {
                    message.channel.sendMessage(`I need ${missingPermissions.join(", ")} to **${command}**.`);
                    logger.missingPermission(client, message, missingPermissions)
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

client.on("presenceUpdate", (oldMember, newMember) => {

});

process.on('unhandledRejection', function (err, promise) {
    console.error('Unhandled rejection (promise: , reason: ', err, ').');
    //console.error('Unhandled rejection (promise: ', promise, ', reason: ', err, ').');
});