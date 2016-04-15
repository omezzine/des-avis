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
        const query = {
                category: req.query.category || undefined,
                checked: req.query.checked || false,
                created_at: {
                    $gte: new Date(req.query.from).getTime() || undefined,
                    $lt: new Date(req.query.to).getTime() || undefined
                }
            }
            // data
        let itemsPromise = AmazonHelper.GetFetchedItem(query, page, limit);
        let categoriesPromise = CategoriesHelper.LoadAllCategories({
            parent: {
                $exists: true
            }
        }, {
            grouped: false
        });
        Promise.all([itemsPromise, categoriesPromise]).then(function(data) {
            res.render('admin/amazon/index', {
                title: 'Amazon Fetched Items List',
                items: data[0].docs,
                pages: data[0].pages,
                current_page: data[0].page,
                current_limit: data[0].limit,
                categories: data[1],
                allowCreate: (query.checked == "true") ? (false) : (true)
            });
        });
    }

    runAutoFetch(req, res) {
        AmazonHelper.FetchItems().then(function() {
            res.redirect('/admin/amazon/items');
        }, function(err) {
            res.redirect('/admin/amazon/items');
        })
    }

    // Create items from amazon
    create(req, res) {
        let items = JSON.parse(req.body.items);
        let isSmart = req.body.provider === "smart";
        let itemsPromise = AmazonHelper.CreateItemsFromAmazon(items);
        let amazonItemsUpdatePromise = AmazonHelper.UpdateAmazonItems(items, isSmart);

        Promise.all([itemsPromise, amazonItemsUpdatePromise]).then(function(data) {
            req.flash('info', 'Items has been successfully created');
            res.status(200).json({
                message: 'Items Has been Created'
            });
        });
    }

    // smart seach amazon
    smart(req, res) {

        let categoriesPromise = CategoriesHelper.LoadAllCategories({
            parent: {
                $exists: true
            }
        }, {
            grouped: false
        });
        
        let query = {
            category: req.query.category,
            limit: req.query.limit,
            keyword: req.query.keyword
        }
        let smartFetchItemsPromise = AmazonHelper.SmartSearch(query);

        Promise.all([categoriesPromise, smartFetchItemsPromise]).then(function(data) {
            res.render('admin/amazon/smart', {
                title: 'Amazon Smart Search',               
                items: data[1],
                categories: data[0],
            })
        })

    }

    delete(req, res) {
        let items = JSON.parse(req.body.items);
        AmazonHelper.DeleteAmazonItems(items).then(function(data) {
            req.flash('info', 'Items has been successfully deleted');
            res.status(200).json({
                message: 'Items has been successfully deleted'
            });
        }, function(err) {
            req.flash('error', 'Unable to delete Items');
            res.status(200).json(err);
        })
    }

}

module.exports = new AmazonItemsController();