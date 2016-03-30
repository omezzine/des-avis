'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const User = mongoose.model('User');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

/**
 * Expose
 */

module.exports = new GoogleStrategy({
        clientID: APP_CONFIG.google.clientID,
        clientSecret: APP_CONFIG.google.clientSecret,
        callbackURL: APP_CONFIG.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({
            'google.id': profile.id
        }, function(err, user) {
            if (err) return done(err);
            if (!user) {
                var opts = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    username: profile.username,
                    provider: 'google',
                    google: profile._json
                }
                if (profile.birthday) {
                    opts.birthday = new Date(profile.birthday).getTime();
                }
                user = new User(opts);
                user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
                });
            } else {
                return done(err, user);
            }
        });
    }
);