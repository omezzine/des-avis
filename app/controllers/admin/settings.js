'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const Utils = rootRequire('libs/utils');
const SettingsHelper = rootRequire('app/helpers/settings');
const UsersHelper = rootRequire('app/helpers/users');


class SettingsController {

    index(req, res) {
        res.render('admin/settings', {
            title: 'Settings'
        });
    }

    updateProfil(req, res) {
        SettingsHelper.updateAdminPassword(req.user, req.body).then(function() {
            req.flash('info', 'Password has been successfully updated');
            res.redirect('/admin/settings');
        }, function(err) {
            req.flash('error', err);
            res.redirect('/admin/settings');
        })
    }

    createAdmin(req, res) {
        UsersHelper.createAdmin(req.body).then(function() {
            req.flash('info', 'New Admin has been successfully created');
            res.redirect('/admin/settings');
        }, function(err) {
            req.flash('error', Utils.formatErrors(err.errors));
            res.redirect('/admin/settings');
        });
    }


}

module.exports = new SettingsController();