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
            },
            message: event
        }, level);
    },
    closeEvent: function (data, level, event) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: Sekki
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
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "error"
            }, level);
    },
    warn: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "warn"
            }, level);
    },
    guildBan: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildBan"
            }, level);
    },
    guildMember: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildMember"
            }, level);
    },
    guildMembers: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildMembers"
            }, level);
    },
    guild: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guild"
            }, level);
    },
    role: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "role"
            }, level);
    },
    roles: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "roles"
            }, level);
    },
    channel: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "channel"
            }, level);
    },
    channels: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "channels"
            }, level);
    },
    unhandledRejection: function (data, level, event) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "unhandledRejection"
            }, level);
    },
    sharp: function (data, level, error, embedImage) {

    },
    base64: function (data, level, error, embedImage) {

    }
};

module.exports = embedBuilder;