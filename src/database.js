const JsonDB = require('node-json-db');

database = new JsonDB("data/db", true, true);

module.exports = database;