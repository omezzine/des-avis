'use strict';

const AjaxActionsHelper = rootRequire('app/helpers/ajaxActions');
const CommentsHelper = rootRequire('app/helpers/comments');
const ItemsHelper = rootRequire('app/helpers/items');
const MessagesHelper = rootRequire('app/helpers/messages');
const Utils = rootRequire('/libs/utils');
const linkGenerator = rootRequire('/libs/linkGenerator');
const logger = rootRequire('config/logger');

class AjaxActionsController {

    search(req, res) {
        AjaxActionsHelper.search(req.query.q).then(function(data) {
            res.status(200).json(data);
        }, function(err) {
            logger.error(err);           
            res.status(400).json(err);
        })
    }

    createItem(req, res) {
        let label = req.params.label;
        ItemsHelper.createItemFromSearchBar(label, 'All').then(function(item) {
            res.redirect(linkGenerator.GenerateItemUrl(item.category.slug, item.slug));
        }, function(err) {
            logger.error(err);
            res.redirect('/');
        })
    }

    addComment(req, res) {
    	CommentsHelper.AddComment(req.user, req.body.anonymous, req.body.text, req.body.item_id).then(function(comment) {
            res.render('partials/front/details/comment', {comment: comment});
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        });
    }
    
    addSubComment(req, res) {
        CommentsHelper.addSubComment(req.user, req.body.text, req.body.parent_comment).then(function(comment) {
            console.log(comment)
            res.render('partials/front/details/_sub_comment', {sub_comment: comment});
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        });
    }

    like(req, res) {
        CommentsHelper.Like(req.user.id, req.body.comment_id).then(function(comment) {
            res.status(200).json(comment);
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        });    
    }

    deleteComment(req, res) {
        CommentsHelper.DeleteComment(req.user._id, req.body.comment_id).then(function(comment) {
            res.status(200).json({message: "Votre commentaire a été supprimé"});
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        });  
    }

    signalSpam(req, res) {
    	CommentsHelper.Signal(req.user._id, req.body.comment_id).then(function(comment) {
            res.status(200).json({message: "Le commentaire a été signalé"});
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        }); 
    }

    itemRate(req, res) {
        ItemsHelper.Rate(req.body.item_id, req.user, req.body.rate).then(function(item) {
            res.status(200).json({message: "Merci"});
        }, function(err) {
            logger.error(err);
            res.status(400).json(err);
        });      
    }

    popuprate(req, res) {
        let itemRatePromise  = ItemsHelper.Rate(req.body.item_id, req.user, req.body.rate);
        let itemCommentPromise = CommentsHelper.AddComment(req.user, req.body.anonymous, req.body.comment, req.body.item_id);
        Promise.all([itemRatePromise, itemCommentPromise]).then(function(data) {
            res.status(200).json({message: "Votre avis nous intéresse! Merci"});
        }, function(err) {
            logger.error(err);
            res.status(400).json(Utils.FormatErrors(err));
        })
    }

    contact(req, res) {
        MessagesHelper.SaveMessage(req.body).then(function(comment) {
            res.status(200).json({message: "Votre Message a été envoyé"});
        }, function(err) {
            logger.error(err);
            res.status(400).json(Utils.FormatErrors(err));
        }); 
    }

}

module.exports = new AjaxActionsController();