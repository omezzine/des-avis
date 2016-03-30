'use strict';

const mongoose = require('mongoose');
const AmazonItem = mongoose.model('AmazonItem');
const Item = mongoose.model('Item');
const OperationHelper = require('apac').OperationHelper;
const opHelper = new OperationHelper({
    awsId: APP_CONFIG.amazon.awsId,
    awsSecret: APP_CONFIG.amazon.awsSecret,
    assocId: APP_CONFIG.amazon.assocId,
    version: '2013-08-01',
    endPoint: 'ecs.amazonaws.fr'
});
const async = require('async');
const CategoriesHelper = rootRequire('app/helpers/categories');

class AmazonHelper {

    static FetchItemsByCategory(category) {
        let promise = new Promise(function(resolve, reject) {
            opHelper.execute('ItemSearch', {
                'SearchIndex': category.amazon_label,
                "Keywords": "*",
                'ResponseGroup': 'Images,ItemAttributes'
            }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
                if (err) {
                    resolve([]);
                } else {
                    if (results && results.ItemSearchResponse && results.ItemSearchResponse.Items[0] && results.ItemSearchResponse.Items[0].Item) {
                        let _items = [];
                        results.ItemSearchResponse.Items[0].Item.forEach(function(item) {
                            try {
                                _items.push({
                                    category: category._id,
                                    label: item.ItemAttributes[0].Title,
                                    thumbnail: item.SmallImage[0].URL[0] || item.MediumImage[0].URL[0] || item.LargeImage[0].URL[0]
                                })
                            } catch (e) {
                                console.log(e.message);
                            }
                        });
                        resolve(_items);
                    } else {
                        resolve([]);
                    }
                }
            })
        })

        return promise;
    }

    static FetchItems() {
        let promise = new Promise(function(resolve, reject) {
            CategoriesHelper.LoadAllCategories({
                parent: {
                    $exists: true
                }
            }, {
                grouped: false
            }).then(function(categories) {
                async.forEach(categories, function(cat, callback) {
                    if (!cat.amazon_label) {
                        callback();
                    } else {
                        AmazonHelper.FetchItemsByCategory(cat).then(function(items) {
                            AmazonItem.create(items, function(err, items) {
                                callback();
                            });
                        });
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    resolve();
                })
            })
        })
        return promise;
    }


    static GetFetchedItem(query, page, limit, category) {
        if (category) {
            query.category = category;
        }
        let promise = new Promise(function(resolve, reject) {
            AmazonItem.paginate(query, {
                populate: 'category',
                page: page,
                limit: limit
            }, function(err, items) {
                if (err) {
                    reject(err);
                } else {
                    resolve(items);
                }
            })
        })
        return promise;
    }


    static CreateItemsFromAmazon(items) {
        items = items.map(function(o) {
            return {
                label: o.label,
                category: o.category,
                thumbnail: o.thumbnail,
                provider: 'Amazon'
            }
        });
        let promise = new Promise(function(resolve, reject) {
            Item.create(items, function(err, items) {
                resolve(items);
            });
        });
        return promise;
    }

    static UpdateAmazonItems(items) {
        let promise = new Promise(function(resolve, reject) {
            let ids = items.map((item) => item.id);
            AmazonItem.update({
                _id: {
                    $in: ids
                }
            }, {
                checked: true
            }, {multi: true}, function(err, items) {
                if (err) {
                    console.log(err);
                }
                resolve(items);
            });
        });
        return promise;
    }




}

module.exports = AmazonHelper;