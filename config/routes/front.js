'use strict';

// **Load Dependencies
const express = require('express');
const authorization = rootRequire('config/middlewares/authorization');
const HomeController = rootRequire('app/controllers/front/home');
const AuthController = rootRequire('app/controllers/front/auth');
const AjaxActionsController = rootRequire('app/controllers/front/ajaxActions');
const DetailsController = rootRequire('app/controllers/front/details');
const AntiSpam = rootRequire('config/middlewares/antiSpam');
const passport = require('passport');

module.exports = function(app) {

    // Home 
    let homeRouter = express.Router();
    homeRouter
        .get('/', HomeController.index)
        .get('/search', AjaxActionsController.search);
    app.use('/', homeRouter);


    app.use('/avis/:category/:slug', DetailsController.index);
    app.use('/avis/:category', HomeController.listByCategory);

    // Auth
    let AuthRouter = express.Router();
    AuthRouter
        .post('/signup', AuthController.signup)
        .post('/forgot', AuthController.ForgotPassword)
        .get('/reset/:token', AuthController.ResetPassword)
        .post('/newPassword', AuthController.NewPassword)
        .post('/local', AuthController.getLocalLogin)
        .get('/facebook', AuthController.getfacebooklogin)
        .get('/facebook/callback', AuthController.facebookcallback)
        .get('/google', AuthController.getgooglelogin)
        .get('/google/callback', AuthController.googlecallback)
        .get('/success', AuthController.success)
        .get('/failure', AuthController.failure)
        .get('/logout', AuthController.logout);
    app.use('/auth', AuthRouter);


    // Comments
    let commentsRouter = express.Router();
    commentsRouter
        .post('/add', AjaxActionsController.addComment)
        .post('/like', AjaxActionsController.like)
        .post('/signal', AjaxActionsController.signalSpam)
        .post('/delete', AjaxActionsController.deleteComment)
        .post('/addSubComment', AjaxActionsController.addSubComment)
    app.use('/ajax/comments', AntiSpam.userBruteforce, authorization.requireLogin(), commentsRouter);

    // contact
    let contactRouter = express.Router();
    contactRouter.post('/', AjaxActionsController.contact);
    app.use('/ajax/contact', AntiSpam.contactBruteforce, contactRouter);

    // items
    let itemsRouter = express.Router();
    itemsRouter
        .post('/rate', AjaxActionsController.itemRate)
        .post('/popuprate', AjaxActionsController.popuprate);
    app.use('/ajax/items', authorization.requireLogin(), itemsRouter);

    app.use('/createItem/:category/:label', AjaxActionsController.createItem);
}