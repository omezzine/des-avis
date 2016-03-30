'use strict';

// Load Dependencies
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const CategoriesHelper = rootRequire('app/helpers/categories');
const ItemsHelper = rootRequire('app/helpers/items');
const AmazonHelper = rootRequire('app/helpers/amazon');

class AmazonItemsController {

    // Listing
    index(req, res) {
        // query params
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const category = req.query.category || undefined;
        const query = {
            checked: req.query.checked || false
        }
        // data
        let itemsPromise = AmazonHelper.GetFetchedItem(query, page, limit, category);
        let categoriesPromise = CategoriesHelper.LoadAllCategories({parent: { $exists: true }}, {grouped: false});     
        Promise.all([itemsPromise, categoriesPromise]).then(function(data) {
            res.render('admin/amazon/index', {
                title: 'Amazon Fetched Items List',
                items: data[0].docs,
                pages: data[0].pages,
                current_page: data[0].page,
                current_limit: data[0].limit,
                categories: data[1],
                allowCreate: (query.checked == "true")?(false):(true)
            });
        });
    }

    // Create items from amazon
    create(req, res) {
        let items = JSON.parse(req.body.items);

        let itemsPromise = AmazonHelper.CreateItemsFromAmazon(items);
        let amazonItemsUpdatePromise = AmazonHelper.UpdateAmazonItems(items);

        Promise.all([itemsPromise, amazonItemsUpdatePromise]).then(function(data) {
            req.flash('info', 'Items has been successfully created');
            res.status(200).json({message: 'Items Has been Created'});
        });
    }

    delete(req, res) {
        let items = JSON.parse(req.body.items);
        AmazonHelper.DeleteAmazonItems(items).then(function(data) {
            req.flash('info', 'Items has been successfully deleted');
            res.status(200).json({message: 'Items has been successfully deleted'});
        }, function(err) {
            req.flash('error', 'Unable to delete Items');
            res.status(200).json(err);
        })
    }

}

module.exports = new AmazonItemsController();