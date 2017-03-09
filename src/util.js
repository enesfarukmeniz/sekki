const util = {
    userNotifier: function (channel, message, time = 5) {
        channel.sendMessage(message).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, time * 1000);
        });
    },
    userNotifierPreMessage: function (msg, message, time = 5) {
        msg.edit(message).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, time * 1000);
        });
    },
    getLogData: function (database, key) {
        try {
            return database.getData(key);
        } catch (e) {
            return true;
        }
    },
    setLogData: function (database, key, value) {
        database.push(key, value);
    }
};

module.exports = util;