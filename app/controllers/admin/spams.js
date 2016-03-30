'use strict';

const CommentsHelper = rootRequire('app/helpers/comments');
const Utils = rootRequire('libs/utils');

class SpamsController {

    comments(req, res) {
        CommentsHelper.LoadSignaledComments(1).then(function(comments) {
            res.render('admin/spams/comments', {
                title: 'Signaled Comments',
                comments: comments.docs
            });
        }, function(err) {
            req.flash('error', Utils.formatErrors(err));
            res.redirect('/admin/dashboard');
        });
    }

    items(req, res, next) {

    }


}

module.exports = new SpamsController();