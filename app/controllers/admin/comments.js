'use strict';

const CommentsHelper = rootRequire('app/helpers/comments');


class CommentsController {

    // Render Details
    show(req, res) {
    	CommentsHelper.LoadById(req.params.id).then(function(comment) {
    		res.render('admin/comments/show', {
    			title: 'Comment Details',
    			comment: comment
    		})
    	}, function(err) {
    		req.flash('error', Utils.formatErrors(err));
            res.redirect('/admin/dashboard');
    	})
    }

    // Delete Comment
    delete(req, res) {

    }


}

module.exports = new CommentsController();