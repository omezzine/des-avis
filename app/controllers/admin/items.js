'use strict';

// Load Dependencies
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const CategoriesHelper = rootRequire('app/helpers/categories');
const ItemsHelper = rootRequire('app/helpers/items');
const _ = require('lodash');
const Utils = rootRequire('libs/utils');

class ItemsController {

    // Listing
    index(req, res) {
        // query params
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let query = {
            category: req.query.category || undefined,
            approuved: (req.query.not_approuved == "true")?(false):(undefined)
        }
        if (req.query.query) {
            query.label = {
                    $regex: req.query.query,
                    $options: "i"
                }
        }
        // data
        let itemsPromise = ItemsHelper.LoadAllItems(page, limit, query);
        let categoriesPromise = CategoriesHelper.LoadAllCategories({parent: { $exists: true }}, {grouped: false});     
        Promise.all([itemsPromise, categoriesPromise]).then(function(data) {
            res.render('admin/items', {
                title: 'Items List',
                items: data[0].docs,
                pages: data[0].pages,
                current_page: data[0].page,
                current_limit: data[0].limit,
                categories: data[1]
            });
        });
    }

    // Render New 
    new(req, res) {
        CategoriesHelper.LoadAllCategories({parent: { $exists: true }}, {grouped: false}).then(function(categories) {
            res.render('admin/items/new', {
                title: 'New Item',
                categories: categories,
                item: new Item({
                    label: ''
                })
            });
        });
    }

    // Show Details
    show(req, res) {
        ItemsHelper.LoadItemById(req.params.id).then(function(item) {
            console.log('here');
            res.render('admin/items/show', {
                item: item,
                title: item.label
            });
        });
    }

    // Create new item
    create(req, res) {
        ItemsHelper.AddNewItem(req.body).then(function(item) {
            req.flash('info', 'New Item has been successfully created');
            res.redirect('/admin/items');
        }, function(err) {
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/items');
        })
    }

    // Rende edit page
    edit(req, res) {
        ItemsHelper.LoadItemById(req.params.id).then(function(item) {
            CategoriesHelper.LoadAllCategories().then(function(categories) {
                res.render('admin/items/edit', {
                    title: 'Edit Item',
                    item: item,
                    categories: categories
                });
            })
        });
    }

    // Update item
    update(req, res) {
        ItemsHelper.UpdateItem(req.body).then(function(category) {
            req.flash('info', 'Item has been successfully updated');
            res.redirect('/admin/items');
        }, function(err) {
            req.flash('error', Utils.FormatErrors(err));
            res.redirect('/admin/items');
        });
    }

    // Delete item
    delete(req, res) {
        Item.findOneAndRemove({
            _id: req.params.id
        }, function(err, user) {
            if (err) {
                req.flash('error', 'Unable to delete Item');
            } else {
                req.flash('info', 'Item has been successfully deleted');
            }
            res.redirect('/admin/items');
        });
    }

}

module.exports = new ItemsController();