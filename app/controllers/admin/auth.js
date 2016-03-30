'use strict';

const passport = require('passport');

class AuthController {

    getLogin(req, res) {
        res.render('admin/auth/login', {
            title: 'Login'
        });
    }

    checkLogin(req, res, next) {
        return passport.authenticate('local', {
            failureRedirect: '/admin/auth',
            failureFlash: 'Invalid email or password.'
        })(req, res, next);
    }

    logout(req, res) {
        req.flash('info', 'you are logged out');
        req.logout();
        res.redirect('/admin/sessions');
    }

}

module.exports = new AuthController();