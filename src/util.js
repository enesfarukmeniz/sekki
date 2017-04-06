let database = require("./database.js");

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
    scrubOutput: function (client, output) {
        return output.replace(new RegExp(client.token, 'g'), '*insert token*')
            .replace(new RegExp(client.user.email, 'g'), '*insert mail*');
    },
    getData: function (key, def = false) {
        try {
            return database.getData(key);
        } catch (e) {
            return def;
        }
    },
    setData: function (key, value) {
        database.push(key, value);
    },
    loggable: function (logParams) {
        let result = true;
        for (key of Object.keys(logParams)) {
            result = result && util.getData("/log/" + key + "/" + logParams[key], true);
        }
        return result;
    }
};

module.exports = util;