module.exports = {

    requireLogin: function() {
        var _requireLogin = function(req, res, next) {
            if (req.isAuthenticated()) return next()
            if (req.xhr) {
                res.status(401).json({
                    message: "Vous n'êtes pas connecté"
                })
            } else {
                res.redirect('/admin/auth')
            }

        }
        _requireLogin.unless = require('express-unless');
        return _requireLogin;
    },

    requireLogout: function(req, res, next) {
        if (!req.isAuthenticated()) return next()
        res.redirect(req.session.returnTo);
    },

    requireAdminRole: function() {
        var _requireAdminRole = function(req, res, next) {
            if (req.user && req.user.role === "Admin") return next();
            next(new Error('Forbidden Access'));
        }
        _requireAdminRole.unless = require('express-unless');
        return _requireAdminRole;
    }

}