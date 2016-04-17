// **Load Dependecies
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const engine = require('ejs-mate');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const mongoRedis = require('connect-redis')(session);
const redisClient = require('./redis');
const methodOverride = require('method-override');
const passport = require('passport');
const templateMiddleware = require('./middlewares/template');

module.exports = function(app) {
	
	// Set View Engine
	app.engine('ejs', engine);
	app.set('views', path.join(PATH_ROOT, 'app/views'));
	app.set('view engine', 'ejs');


	// Set Static folders
	app.use(express.static(path.join(PATH_ROOT, 'public')));
    app.use(favicon(path.join(PATH_ROOT, '/public/favicon.ico')));
	

    // Set body Parser
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    // Handle other methods PUT DELETE ..
    app.use(methodOverride(function(req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    app.use(cookieParser());

	// Set Express Session
	app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'secret',
        store: new mongoRedis({
            client: redisClient
        }),
        cookie: {
            expires: new Date(Date.now() + 3600000),
            maxAge: 3600000
        }
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());
    // init passport strategry
    require('./passport')(passport);

	// csurf
    // Do Not Use For Test Env
    if (process.env.NODE_ENV !== 'test') {
        app.use(csurf());
    }

    // use flash
    // use session
    app.use(flash());

    // Template MiddleWares
    app.use(templateMiddleware);


}