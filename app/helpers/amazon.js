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
const Utils = rootRequire('libs/utils');
const ItemsHelper = rootRequire('app/helpers/items');

class AmazonHelper {

    static FetchItemsByCategoryAndKeywords(category, keywords) {
        keywords = keywords || '*';
        let promise = new Promise(function(resolve, reject) {
            opHelper.execute('ItemSearch', {
                'SearchIndex': category.amazon_label,
                "Keywords": keywords,
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
                        AmazonHelper.FetchItemsByCategoryAndKeywords(cat).then(function(items) {
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


    static GetFetchedItem(query, page, limit) {
        query = Utils.DeleteNullPropertiesFromObject(query, true);
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
                provider: 'Amazon',
                approuved: true
            }
        });
        let promise = new Promise(function(resolve, reject) {
            Item.create(items, function(err, items) {
                // fetch amazon data for new added items                
                items.forEach(function(item) {
                    ItemsHelper.ItemAmazonSearch(item);
                });
                resolve(items);
            });
        });
        return promise;
    }

    static UpdateAmazonItems(items, isSmart) {
        let promise = new Promise(function(resolve, reject) {
            if (isSmart) {
                resolve([]);
            } else {
                let ids = items.map((item) => item.id);
                AmazonItem.update({
                    _id: {
                        $in: ids
                    }
                }, {
                    checked: true
                }, {
                    multi: true
                }, function(err, items) {
                    if (err) {
                        console.log(err);
                    }
                    resolve(items);
                });
            }

        });
        return promise;
    }

    static DeleteAmazonItems(items) {
        let promise = new Promise(function(resolve, reject) {
            let ids = items.map((item) => item.id);
            AmazonItem.remove({
                _id: {
                    $in: ids
                }
            }, function(err, items) {
                if (err) {
                    reject(err);
                } else {
                    resolve(items);
                }
            });
        });
        return promise;
    }

    static SmartSearch(query) {
        query = Utils.DeleteNullPropertiesFromObject(query, true);
        let result = [];
        let promise = new Promise(function(resolve, reject) {
            ItemsHelper.LoadItemsByQuery(query).then(function(data) {
                async.forEach(data, function(item, callback) {
                    if (!item.category.amazon_label) {
                        callback();
                    } else {
                        AmazonHelper.FetchItemsByCategoryAndKeywords(item.category, item.label).then(function(items) {
                            items = items.map(function(_item) {
                                return {
                                    category: item.category,
                                    label: _item.label,
                                    thumbnail: _item.thumbnail
                                }
                            });
                            result = result.concat(items);
                            callback();
                        });
                    }
                }, function(err) {
                    if (err) {
                        console.log(err);
                    }
                    resolve(result);
                })
            }, function(err) {
                reject(err);
            })
        })

        return promise;
    }


    static AmazonQuickSearch(key) {
        let items = [];
        let promise = new Promise(function(resolve, reject) {
            opHelper.execute('ItemSearch', {
                'SearchIndex': 'All',
                'Keywords': key,
                'ResponseGroup': 'Images, ItemAttributes'
            }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
                if (err) {
                    reject(err);
                } else {
                    if (results && results.ItemSearchResponse && results.ItemSearchResponse.Items[0].Item) {
                        results.ItemSearchResponse.Items[0].Item.forEach(function(item) {
                            items.push({
                                category: item.ItemAttributes[0].ProductTypeName[0],
                                label: item.ItemAttributes[0].Title[0],
                                thumbnail: item.ImageSets[0].ImageSet[0].ThumbnailImage[0].URL[0],
                                rate: undefined,
                                tmp: true
                            })
                        })
                        resolve(items);
                    } else {
                        resolve(items);
                    }

                }
            });
        });
        return promise;
    }



}

module.exports = AmazonHelper;