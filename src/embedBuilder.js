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

    },
    emoji: function (data, level) {

    },
    closeEvent: function (data, level) {

    },
    mention: function (data, level) {

    },
    missingPermissions: function (data, level) {

    },
    error: function (data, level) {

    },
    warn: function (data, level) {

    },
    guildBan: function (data, level) {

    },
    guildMember: function (data, level) {

    },
    guildMembers: function (data, level) {

    },
    guild: function (data, level) {

    },
    role: function (data, level) {

    },
    roles: function (data, level) {

    },
    channel: function (data, level) {

    },
    channels: function (data, level) {

    },
    unhandledRejection: function (data, level) {

    }
};

module.exports = embedBuilder;