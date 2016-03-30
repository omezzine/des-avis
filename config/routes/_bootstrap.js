const express = require('express');
const CategoriesHelper = rootRequire('app/helpers/categories');

module.exports = function(app) {

    // Load Admin Routes
    require('./admin')(app);

    // Load Front Routes
    require('./front')(app);


    // error handlers
    app.use(function(err, req, res, next) {
        // treat as 404
        if (err.message && (~err.message.indexOf('not found') || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        // error page
        if (req.xhr) {
            console.log(err.stack)
            res.status(500).send({
                error_code: 500,
                message: "500 internal server error"
            });
        } else {
            res.status(500).render('500', {
                error: err.stack
            });
        }

    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        if (req.xhr) {
            res.status(404).send({
                error_code: 404,
                message: '404 not found'
            });
        } else {
            CategoriesHelper.LoadAllCategories({}, {
                grouped: true
            }).then(function(categories) {
                res.status(404).render('404', {
                    categories: categories,
                    error: 'Not found',
                    two_columns: true
                });   
            }, function() {
                res.status(404).render('404', {
                    categories: [],
                    error: 'Not found',
                    two_columns: true
                });  
            })

        }

    });
}