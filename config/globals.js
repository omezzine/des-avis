
// **Load Dependecies
const config = require('./config');
const path = require('path');



// Set The App Name
global.APP_NAME = "Des Avis";

// Set Global Configs
global.APP_CONFIG = config;

// Paht Root
global.PATH_ROOT = path.join(__dirname, '..');

// Set Root Require function 
global.rootRequire = function(name) {
    return require(path.join(PATH_ROOT, name));
}