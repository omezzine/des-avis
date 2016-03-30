'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const UsersHelper = rootRequire('app/helpers/users');
const Utils = rootRequire('libs/utils');

class UsersController {

    // Render Index
    index(req, res) {

        // query params
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let sort = Utils.CreateSortObject(req.query);

        UsersHelper.LoadAllUsers(page, limit, sort).then(function(data) {
            res.render('admin/users', {
                title: 'Users List',
                users: data.docs,
                pages: data.pages,
                current_page: data.page,
                current_limit: data.limit,
            });
        });
    }

    // Render new page 
    new(req, res) {
        res.render('admin/users/new', {
            title: 'New User',
            user: new User({})
        });
    }

    // Render Show 
    show(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) req.flash('error', err);
            res.render('admin/users/show', {
                title: user.display_name,
                user: user
            });
        });
    }

    // Create new
    create(req, res) {
        UsersHelper.CreateUser(req.body).then(function() {
            req.flash('info', 'User has been successfully created');
            res.redirect('/admin/users');
        }, function(err) {
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/users/new');
        })
    }

    // Render Edit page
    edit(req, res) {
        User.findById(req.params.id, function(err, user) {
            if (err) req.flash('error', Utils.FormatErrors(err));
            res.render('admin/users/edit', {
                user: user,
                title: user.display_name
            });
        });
    }

    // Update User
    update(req, res) {
        UsersHelper.UpdateUser(req.body).then(function() {
            req.flash('info', 'User has been successfully updated');
            res.redirect('/admin/users');
        }, function(err) {
            console.log(err);
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/users/' + req.body.id + '/edit');
        })
    }

    // Delete User
    delete(req, res) {
        User.findOneAndRemove({
            _id: req.params.id
        }, function(err, user) {
            if (err) {
                req.flash('error', 'Unable to delete ' + user.display_name);
            } else {
                req.flash('info', 'User' + user.display_name + 'has been successfully deleted');
            }
            res.redirect('/admin/users');
        });
    }

}

module.exports = new UsersController();