//var viewUtils = rootRequire('libs/viewUtils');
const moment = rootRequire('config/locales/moment');
const url = require('url');
const qs = require('querystring');
const LinkGenerator = rootRequire('libs/linkGenerator');

function fullUrl(req) {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}

module.exports = function(req, res, next) {
    res.locals.title = res.locals.title || 'des-avis.fr';
    res.locals.messages = req.flash();
    res.locals.current_user = req.user || null;
    res.locals.ShowSearchBar = true;
    res.locals.url = url;
    res.locals.env = process.env.NODE_ENV || 'development';
    res.locals.LinkGenerator = LinkGenerator;
    res.locals.current_url = req.url;
    res.locals.full_url = fullUrl(req);
    res.locals.qs = qs;
    res.locals._ = require('lodash');
    res.locals.moment = moment;
    if (req.csrfToken) {
        res.locals.csrf_token = req.csrfToken();
    }
    next();
}