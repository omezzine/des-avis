'use strict';
const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');
const moment = require('moment');
const store = new RedisStore({
    client: rootRequire('config/redis')
});


const failCallback = function(req, res, next, nextValidRequestDate) {
    if (req.xhr) {
        res.status(403).json({message: "You've made too many failed attempts in a short period of time, please try again " + moment(nextValidRequestDate).fromNow()})
    } else {
        req.flash('error', "You've made too many failed attempts in a short period of time, please try again " + moment(nextValidRequestDate).fromNow());
        res.redirect('/');
    }
};

const handleStoreError = function(error) {
    log.error(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
    throw {
        message: error.message,
        parent: error.parent
    };
}

// Start slowing requests after 5 failed attempts to do something for the same user
let userBruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    proxyDepth: 1,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour,
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

// Start slowing requests after 3 failed attempts to do something for the same user
let contactBruteforce = new ExpressBrute(store, {
    freeRetries: 3,
    proxyDepth: 1,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour,
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

// No more than 1000 login attempts per day per IP
let globalBruteforce = new ExpressBrute(store, {
    freeRetries: 1000,
    proxyDepth: 1,
    attachResetToRequest: false,
    refreshTimeoutOnRequest: false,
    minWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time)
    maxWait: 25 * 60 * 60 * 1000, // 1 day 1 hour (should never reach this wait time)
    lifetime: 24 * 60 * 60, // 1 day (seconds not milliseconds)
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

module.exports = {
    globalBruteforce: globalBruteforce.prevent,
    userBruteforce: userBruteforce.prevent,
    contactBruteforce: contactBruteforce.prevent
}