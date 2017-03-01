const winston = require("winston");
require("winston-daily-rotate-file");
//TODO lots of work here...
const logger = {
    mention: function(message) {
        //console.log(arguments)
    },
    noCommand: function() {
        //console.log(arguments)
    },
    missingPermission: function() {
        //console.log(arguments)
    },
    log: function () {

    },
    warn: function () {

    },
    error : function () {

    }
};

module.exports = logger;