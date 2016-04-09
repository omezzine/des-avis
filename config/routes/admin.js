'use strict';

// **Load Dependencies
const express = require('express');
const authorization = rootRequire('config/middlewares/authorization');
const AuthController = rootRequire('app/controllers/admin/auth');
const SettingsController = rootRequire('app/controllers/admin/settings');
const DashboardController = rootRequire('app/controllers/admin/dashboard');
const UsersController = rootRequire('app/controllers/admin/users');
const CategoriesController = rootRequire('app/controllers/admin/categories');
const ItemsController = rootRequire('app/controllers/admin/items');
const SpamsController = rootRequire('app/controllers/admin/spams');
const CommentsController = rootRequire('app/controllers/admin/comments');
const AmazonItemsController = rootRequire('app/controllers/admin/amazonItems');
const MessagesController = rootRequire('app/controllers/admin/messages');

module.exports = function(app) {



	// Set Admin Controls
    app.use('/admin/*', authorization.requireLogin().unless({
        path: ['/admin/auth']
    }), authorization.requireAdminRole().unless({
        path: ['/admin/auth']
    }));

	// Admin Auth
	let authRouter = express.Router();
	authRouter
		.get('/', AuthController.getLogin)
		.post('/', AuthController.checkLogin, function(req, res) {res.redirect('/admin/dashboard')})
		.get('/delete', AuthController.logout);
	app.use('/admin/auth', authRouter);

	// Admin Dashboard
	let dashboardRouter = express.Router();
	dashboardRouter.get('/', DashboardController.index);
	app.use('/admin/dashboard', dashboardRouter);

	// Admin Settings
	let settingsRouter = express.Router();
	settingsRouter
		.get('/', SettingsController.index)
		.post('/createAdmin', SettingsController.createAdmin)
		.put('/updateProfil', SettingsController.updateProfil);
	app.use('/admin/settings', settingsRouter);

	// Handle /admin/users
	let usersRouter = express.Router();
	usersRouter
		.get('/', UsersController.index)
		.post('/', UsersController.create)
		.get('/:id/edit', UsersController.edit)
		.put('/', UsersController.update)
		.get('/new', UsersController.new)
		.get('/:id', UsersController.show)
		.delete('/:id', UsersController.delete);
	app.use('/admin/users', usersRouter);

	// Handle /admin/categories
	let categoriesRouter = express.Router();
	categoriesRouter
		.get('/', CategoriesController.index)
		.post('/', CategoriesController.create)
		.get('/:id/edit', CategoriesController.edit)
		.put('/', CategoriesController.update)
		.get('/new', CategoriesController.new)
		.get('/:id', CategoriesController.show)
		.delete('/:id', CategoriesController.delete);
	app.use('/admin/categories', categoriesRouter);


	// Handle /admin/items
	let itemsRouter = express.Router();
	itemsRouter
		.get('/', ItemsController.index)
		.post('/', ItemsController.create)
		.get('/:id/edit', ItemsController.edit)
		.put('/', ItemsController.update)
		.get('/new', ItemsController.new)
		.get('/:id', ItemsController.show)
		.delete('/:id', ItemsController.delete);
	app.use('/admin/items', itemsRouter);


	// Handle /admin/comments
	let commentsRouter = express.Router();
	commentsRouter
		.get('/:id', CommentsController.show)
		.delete('/:id', CommentsController.delete)
	app.use('/admin/comments', commentsRouter);

	// Handle /admin/spams
	let spamsRouter = express.Router();
	spamsRouter
		.get('/comments', SpamsController.comments)
		.get('/items', SpamsController.items)
	app.use('/admin/spams', spamsRouter);


	// Handle /admin/amzon
	let amazonItemsRouter = express.Router();
	amazonItemsRouter
		.get('/items', AmazonItemsController.index)
		.post('/create', AmazonItemsController.create)
		.post('/delete', AmazonItemsController.delete)
		.get('/smart', AmazonItemsController.smart)
	app.use('/admin/amazon', amazonItemsRouter);

	// Handle /admin/messages
	let messagesRouter = express.Router();
	messagesRouter
		.get('/', MessagesController.index)
		.get('/:id', MessagesController.show)
		.delete('/:id', MessagesController.delete)
		.post('/reply', MessagesController.reply)
	app.use('/admin/messages', messagesRouter);
	
}