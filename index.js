// ** Load Dependecies
const fs = require('fs');
const path = require('path');
const express = require('express');
const winston = require('winston');

// Init The Application
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';
const app = express();


// BootStrap Globals
require('./config/globals');

// Connect DataBase
require('./config/db')();

// BootStrap Models In Sync Way
fs.readdirSync(path.join(__dirname, 'app/models')).forEach(function(file) {
    if (~file.indexOf('.js')) require(path.join(__dirname, 'app/models', file));
});

// Run Seeds In Sync Way
fs.readdirSync(path.join(__dirname, 'seeds')).forEach(function(file) {
    if (~file.indexOf('.js')) require(path.join(__dirname, 'seeds', file));
});

// BootStrap Express Config
require('./config/express')(app);

// BootStrap Cron
require('./config/cron')();

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});



// BootStrap Routes
require('./config/routes/_bootstrap')(app);


// Caught exception
/*winston.add(winston.transports.File, {
	filename: 'logs/exceptions.log',
	handleExceptions: true,
	humanReadableUnhandledException: false
});*/


// Start Listening
app.listen(port);

// Run Redis
require('./config/redis');

// Run Cron
require('./config/cron');
console.log('NodeJs running in ' + env + ' env');
console.log('Express app started on port ' + port);