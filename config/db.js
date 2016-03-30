'use strict';

const mongoose = require('mongoose');

module.exports = function() {

    // Connect to mongodb
    var connect = function() {
        let options = {
            server: {
                poolSize: 5
            },
            user: APP_CONFIG.database.password,
            pass: APP_CONFIG.database.username
        }
        mongoose.connect(APP_CONFIG.database['uri'], options);
    };
    connect();

    mongoose.connection.on('error', console.log);
    mongoose.connection.on('disconnected', connect);
}