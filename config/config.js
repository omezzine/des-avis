
// Loads Envs
const development = require('./env/development.json');
const test = require('./env/test.json');
const production = require('./env/production.json');


/*
 * Expose 
 */

module.exports = {
    development: development,
    test: test,
    production: production
}[process.env.NODE_ENV || 'development'];