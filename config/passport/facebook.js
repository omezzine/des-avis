'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new FacebookStrategy({
        clientID: APP_CONFIG.facebook.clientID,
        clientSecret: APP_CONFIG.facebook.clientSecret,
        callbackURL: APP_CONFIG.facebook.callbackURL,
        scope: [ 'email', 'public_profile', 'user_photos'],
        profileFields: ['id', 'displayName', 'photos', 'emails', 'birthday']
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            console.log(profile);
            User.findOne({
                'facebook.id': profile.id
            }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err) return done(err);

                if (!user) {
                    // set all of the facebook information in our user model
                    var opts = {
                        email: profile.emails[0].value,
                        username: profile.username || profile.displayName,
                        provider: 'facebook',
                        facebook: profile._json,
                        role: 'User'
                    };

                    if (profile._json.birthday) {
                        opts.birthday = new Date(profile._json.birthday).getTime();
                    }
                    user = new User(opts);

                    // save our user to the databas
                    user.save(function(err) {
                        console.log(err);
                        if (err) done(err);
                        // if successful, return the new user
                        return done(err, user);
                    });

                } else {
                    // user found, return that user
                    return done(err, user);
                }

            });
        })
    }
);