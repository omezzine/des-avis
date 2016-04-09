'use strict';

// Load Dependencies
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const CategoriesHelper = rootRequire('app/helpers/categories');
const _ = require('lodash');
const Utils = rootRequire('libs/utils');

class CategoriesController {

    // Listing
    index(req, res) {
        CategoriesHelper.LoadAllCategories({}, {
            grouped: true
        }).then(function(categories) {
            res.render('admin/categories', {
                title: 'Categories List',
                categories: categories
            });
        });
    }

    // Render New
    new(req, res) {
        CategoriesHelper.LoadAllCategories({
            parent: null
        }, {
            grouped: false
        }).then(function(categories) {
            res.render('admin/categories/new', {
                title: 'Categories List',
                categories: categories,
                category: new Category({
                    label: ''
                })
            });
        });
    }

    // Show Details
    show(req, res) {
        Category.findById(req.params.id)
            .populate('childrens')
            .exec(function(err, category) {
                if (err) req.flash('error', Utils.FormatErrors(err));
                res.render('admin/categories/show', {
                    title: category.label,
                    category: category
                });
            });
    }

    // Create new category
    create(req, res) {
        CategoriesHelper.AddNewCategory(req.body).then(function(err) {
            CategoriesHelper.RemoveFromCache().then(function() {
                req.flash('info', 'New catgeory has been successfully created');
                res.redirect('/admin/categories');
            })
        }, function(err) {
            req.flash('error', Utils.formatErrors(err));
            res.redirect('/admin/categories');
        })
    }

    // Rende edit page
    edit(req, res) {
        CategoriesHelper.LoadCategoryById(req.params.id).then(function(category) {
            CategoriesHelper.LoadAllCategories({
                parent: null
            }).then(function(categories) {
                res.render('admin/categories/edit', {
                    title: 'Categories List',
                    category: category,
                    categories: categories
                });
            })
        });
    }

    // Update catgeory
    update(req, res) {
        CategoriesHelper.UpdateCategory(req.body).then(function(category) {
            CategoriesHelper.RemoveFromCache().then(function() {
                req.flash('info', req.body.label + ' has been successfully updated');
                res.redirect('/admin/categories');
            })
        }, function(err) {
            console.log(err)
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/categories');
        });
    }

    // Delete category
    delete(req, res) {
        Category.findOneAndRemove({
            _id: req.params.id
        }, function(err, category) {
            if (err) {
                req.flash('error', Utils.FormatErrors(err));
            } else {
                Category.update({
                    parent: req.params.id
                }, {
                    parent: undefined
                }, {
                    multi: true
                }, function(err, categories) {

                });
                CategoriesHelper.RemoveFromCache().then(function() {
                    req.flash('info', category.label + ' has been successfully deleted');
                })
            }
            res.redirect('/admin/categories');
        });
    }

}

module.exports = new CategoriesController();