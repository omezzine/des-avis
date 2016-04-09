'use strict';

const MessagesHelper = rootRequire('app/helpers/messages');
const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const Utils = rootRequire('libs/utils');

class MessagesController {

    // Render Index
    index(req, res) {
        // query params
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const query = {
            replied: (req.query.only_replied == "true")?(true):(undefined),
        }
        MessagesHelper.LoadAll(query, page, limit).then(function(data) {
            res.render('admin/messages', {
                title: 'Messages List',
                messages: data.docs,
                pages: data.pages,
                current_page: data.page,
                current_limit: data.limit,
            });
        });

    }

    //show
    show(req, res) {
        Message.findById(req.params.id, function(err, message) {
            if (err) {
                req.flash('error', Utils.FormatErrors(err));
                res.redirect('/admin/messages');
            } else {
                res.render('admin/messages/reply', {
                    title: 'Reply',
                    message: message
                });
            }
        })
    }

    // reply
    reply(req, res) {
        MessagesHelper.reply(req.body.id, req.body.reply_text).then(function(data) {
            req.flash('info', 'Your message has been successfully sent');
            res.redirect('/admin/messages');
        }, function(err) {
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/messages');
        })
    }

    // Delete Messages
    delete(req, res) {
        Message.findOneAndRemove({
            _id: req.params.id
        }, function(err, message) {
            if (!err) {
                req.flash('info', 'Message from  has been successfully deleted');
            }
            res.redirect('/admin/messages');
        });
    }

}

module.exports = new MessagesController();