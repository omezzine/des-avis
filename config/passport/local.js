'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {

        User.findOne({
            'local.email': email
        }, 'local.email local.password', function(err, user) {
            if (err) return done(err)
            if (!user) {
                return done(null, false, {
                    message: 'Unknown user'
                });
            }
            if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }
            return done(null, user);
        });
    }
);