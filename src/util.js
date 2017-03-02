const util = {
    userNotifier: function (channel, message, time = 5) {
        channel.sendMessage(message).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, time * 1000);
        });
    }
}

module.exports = util;