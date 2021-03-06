'use strict';

const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const UsersHelper = rootRequire('app/helpers/users');
const UsersMailer = rootRequire('app/mailers/users');
const Utils = rootRequire('libs/utils');
const CategoriesHelper = rootRequire('app/helpers/categories');

class AuthController {

    getLocalLogin(req, res, next) {
        return passport.authenticate('local', {
            successRedirect: '/auth/success',
            failureRedirect: '/auth/failure'
        })(req, res, next);
    }

    getfacebooklogin(req, res, next) {
        return passport.authenticate('facebook', {
            scope: ['email', 'public_profile', 'user_photos']
        })(req, res, next);
    }

    facebookcallback(req, res, next) {
        return passport.authenticate('facebook', {
            successRedirect: '/auth/success',
            failureRedirect: '/auth/failure'
        })(req, res, next);
    }

    getgooglelogin(req, res, next) {
        return passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    }

    googlecallback(req, res, next) {
        return passport.authenticate('google', {
            successRedirect: '/auth/success',
            failureRedirect: '/auth/failure'
        })(req, res, next)
    }

    success(req, res) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(200).json({
                success: true
            });
        } else {
            res.render('front/popup_after_auth', {
                state: 'success',
                user: req.user ? req.user : null
            });
        }

    }

    failure(req, res) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(400).json({
                message: ' Email ou mot de passe Invalide !'
            });
        } else {
            res.render('front/popup_after_auth', {
                state: 'failure',
                user: null
            });
        }
    }

    ForgotPassword(req, res) {
        UsersHelper.ForgotPassword("mohamed.omezzine@gmail.com").then(function(token) {
            UsersMailer.ForgotPassword(req.headers.host, "mohamed.omezzine@gmail.com", token);
            res.status(200).json({
                message: 'Un Email a été envoyé à ' + req.body.email + ', veuillez suivre les instructions.'
            });
        }, function(err) {
            res.status(400).json({
                message: err
            });
        })
    }

    ResetPassword(req, res) {
        User.findOne({
            'local.resetPasswordToken': req.params.token,
            'local.resetPasswordExpires': {
                $gt: Date.now()
            }
        }, function(err, user) {
            if (!user) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/');
            }
            CategoriesHelper.LoadAllCategories({}, {
                grouped: true
            }).then(function(categories) {
                res.render('front/reset_password', {
                    user: user,
                    two_columns: true,
                    categories: categories
                });
            })

        });
    }

    NewPassword(req, res) {
        console.log(req.body.password, req.body.password_confirm)
        if (req.body.password !== req.body.password_confirm) {
            console.log('here');
            req.flash('error', 'La confirmation du mot de passe ne correspond pas.');
            return res.redirect('back');
        } else {
            User.findOne({
                'local.resetPasswordToken': req.body.token,
                'local.resetPasswordExpires': {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err || !user) {
                    req.flash('error', 'Votre demande de modification a expiré ou invalide.');
                    return res.redirect('/');
                }
                user.local.password = req.body.password;
                user.local.resetPasswordToken = undefined;
                user.local.resetPasswordExpires = undefined;
                user.save(function(err) {
                    if (err) {
                        req.flash('error', 'Votre demande de modification a expiré.');                       
                    } else {
                        req.flash('info', 'Votre mot de passe a été modifié.');
                    }
                    return res.redirect('/');
                });
            })
        }

    }

    signup(req, res) {
        UsersHelper.CreateUser(req.body).then(function(data) {
            res.status(201).json({
                message: 'User Has been created'
            });
        }, function(err) {
            res.status(400).json({
                message: Utils.FormatErrors(err)
            });
        })
    }

    logout(req, res) {
        req.logout();
        res.redirect('/');
    }
}

module.exports = new AuthController();