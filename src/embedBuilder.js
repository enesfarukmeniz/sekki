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
    message: function (data, level) {
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
            message: ""
        }, level);
    },
    empty: function (level) {
        return embedBuilder.colorWrapper({
            embed: {
                author: {
                    name: "Sekki"
                },
                timestamp: new Date(),
            },
            message: "empty"
        }, level);
    },
    emoji: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "emoji"
            }, level);
    },
    closeEvent: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "closeEvent"
            }, level);
    },
    mention: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "mention"
            }, level);
    },
    missingPermissions: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "missingPermissions"
            }, level);
    },
    error: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "error"
            }, level);
    },
    warn: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "warn"
            }, level);
    },
    guildBan: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildBan"
            }, level);
    },
    guildMember: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildMember"
            }, level);
    },
    guildMembers: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guildMembers"
            }, level);
    },
    guild: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "guild"
            }, level);
    },
    role: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "role"
            }, level);
    },
    roles: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "roles"
            }, level);
    },
    channel: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "channel"
            }, level);
    },
    channels: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "channels"
            }, level);
    },
    unhandledRejection: function (data, level) {
        return embedBuilder.colorWrapper(
            {
                embed: {},
                message: "unhandledRejection"
            }, level);
    }
};

module.exports = embedBuilder;