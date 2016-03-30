'use strict';

const redis = require("redis");
var client = redis.createClient();


client.on("error", function (err) {
    console.log("Error " + err);
});

client.on("connect", function() {
	console.log("Redis client is running !")
});

module.exports = client;