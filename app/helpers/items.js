'use strict';

const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const Item = mongoose.model('Item');
const _ = require('lodash');
const OperationHelper = require('apac').OperationHelper;
const opHelper = new OperationHelper({
    awsId: APP_CONFIG.amazon.awsId,
    awsSecret: APP_CONFIG.amazon.awsSecret,
    assocId: APP_CONFIG.amazon.assocId,
    version: '2013-08-01',
    endPoint: 'ecs.amazonaws.fr'
});
const Redis = rootRequire('config/redis');
const COUNT_CACHE_TIME = 1 * 60 * 60 * 6; // 6 hours
const async = require('async');

class ItemsHelper {

    static GetItemsCount() {
        const CACHE_NAME = "items_count";
        let promise = new Promise(function(resolve, reject) {
            Redis.get(CACHE_NAME, function(err, data) {
                if (err || !data) {
                    Item.find({})
                        .lean()
                        .count()
                        .exec(function(err, count) {
                            if (err) {
                                resolve(0)
                            } else {
                                Redis.set(CACHE_NAME, count);
                                Redis.expire(CACHE_NAME, COUNT_CACHE_TIME);
                                resolve(count);
                            }

                        });
                } else {
                    resolve(data);
                }

            })
        })
        return promise;
    }
    static CalculateRateAvg(ratesObj) {
        let mapReduce = ratesObj.reduce(function(values, obj) {
            if (obj.value) {
                values.sum += obj.value;
                values.count++;
                values.average = values.sum / values.count;
            }
            return values;
        }, {
            sum: 0,
            count: 0,
            average: 0
        });

        return mapReduce.average.toFixed(2);
    }
    static Rate(itemId, user, rating) {
        let promise = new Promise(function(resolve, reject) {

            Item.findById(itemId, function(err, item) {
                if (err) {
                    reject(err);
                } else {
                    if (item.rates.filter((rate) => rate.user.equals(user._id)).length) {
                        item.rates.forEach(function(rate) {
                            if (rate.user.equals(user._id)) {
                                rate.value = rating;
                            }
                        });
                    } else {
                        item.rates.push({
                            user: user._id,
                            value: rating
                        });
                    }
                    item.rate = ItemsHelper.CalculateRateAvg(item.rates);
                    item.save(function(err, item) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(item);
                        }
                    });
                }

            })

        })
        return promise;
    }

    static LoadAllItems(page, limit, category) {
        var query = {};
        if (category) {
            query.category = category;
        }
        let promise = new Promise(function(resolve, reject) {
            Item.paginate(query, {
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

    static LoadItemsForSiteMap() {
        let promise = new Promise(function(resolve, reject) {
            Item.find({})
                .select('slug')
                .lean()
                .exec(function(err, items) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                })
        })
        return promise;
    }

    static LoadAllByCategory(category, page) {
        let promise = new Promise(function(resolve, reject) {
            Category.findOne({
                slug: category
            })
                .exec(function(err, cat) {
                    if (err || !cat) {
                        reject(err);
                    } else {
                        Item.paginate({
                            category: cat.id
                        }, {
                            limit: 10,
                            lean: false,
                            page: page,
                            sort: {
                                visits: -1
                            }
                        }, function(err, items) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(items);
                            }
                        })
                    }
                })
        });
        return promise;
    }

    static findItemBySlug(slug) {
        let promise = new Promise(function(resolve, reject) {
            Item
                .findOne({
                    slug: slug
                })
                .populate('category')
                .exec(function(err, item) {
                    if (err || !item) {
                        reject();
                    } else {
                        resolve(item);
                    }
                })
        })
        return promise;
    }

    static GetRelatedItems(item) {
        let promise = new Promise(function(resolve, reject) {
            if ((item.related_items.last_check) && (new Date(item.related_items.last_check).getTime() + (3600000 * 24) > Date.now())) {
                // Just populate                
                Item.find({
                    _id: {
                        $in: item.related_items.items
                    }
                }, function(err, items) {
                    if (err) {
                        console.log(err);
                        resolve([]);
                    } else {
                        resolve(items);
                    }
                });
            } else {
                // Check Again
                Item.find({
                    category: item.category._id,
                    label: {
                        $regex: item.label.split(" ")[0],
                        $options: "i"
                    }
                }).limit(4).exec(function(err, items) {
                    if (err) {
                        console.log(err);
                        reject([])
                    } else {
                        item.related_items.last_check = Date.now();
                        item.related_items.items = items.map((_item) => _item._id);
                        item.save(function(err, item) {
                            if (err) {
                                console.log(err);
                            } else {
                                resolve(items);
                            }
                        })
                    }
                })
            }
        })
        return promise;
    }

    static LoadItemById(id) {

        let promise = new Promise(function(resolve, reject) {
            Item.findById(id, function(err, item) {
                if (err) {
                    reject(err);
                } else {
                    resolve(item);
                }
            })
        })
        return promise;
    }

    static AddNewItem(params) {
        let item = new Item({
            label: params.label,
            category: params.category,
        });

        let promise = new Promise(function(resolve, reject) {
            item.save(function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve()
                }
            })
        })

        return promise;
    }

    static UpdateItem(newitem) {
        let promise = new Promise(function(resolve, reject) {
            ItemsHelper.LoadItemById(newitem._id).then(function(item) {
                item.label = newitem.label;
                item.category = newitem.category;
                item.save(function(err, item) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(item);
                    }
                })
            })
        });
        return promise;
    }

    static IncreaseVisits(itemId, session) {
        let promise = new Promise(function(resolve, reject) {
            if (!session.visits) {
                session.visits = [];
            }
            if (session.visits.indexOf("" + itemId) === -1) {
                session.visits.push("" + itemId);
                Item.findByIdAndUpdate(itemId, {
                    $inc: {
                        visits: 1
                    }
                }, function(err, item) {
                    resolve();
                });
            } else {
                resolve();
            }
        })
        return promise
    }

    static ItemAmazonSearch(item) {
        let promise = new Promise(function(resolve, reject) {
            if (ItemsHelper.ItemNeedToFetchOnAmazon(item)) {
                opHelper.execute('ItemSearch', {
                    'SearchIndex': item.category.amazon_label,
                    'Keywords': item.label,
                    'ResponseGroup': 'Images,ItemAttributes'
                }, function(err, results) { // you can add a third parameter for the raw xml response, "results" here are currently parsed using xml2js
                    if (err) {
                        resolve(item);
                    } else {
                        if (results && results.ItemSearchResponse) {
                            item.amazon.last_fetch = Date.now();
                            item.amazon.more_results = results.ItemSearchResponse.Items[0].MoreSearchResultsUrl[0];
                            item.thumbnail = ItemsHelper.GetThumbnailFromAmazon(results.ItemSearchResponse.Items[0].Item);
                            item.amazon.items = ItemsHelper.FormatAmazonItem(results.ItemSearchResponse.Items[0].Item);
                            item.save(function(err, item) {
                                if (err) console.log(err);
                                resolve(item);
                            });
                        } else {
                            resolve(item);
                        }

                    }
                });
            } else {
                resolve(item);
            }

        });
        return promise;
    }

    static ItemNeedToFetchOnAmazon(item) {
        return true;
        /*if (!item.category.amazon_label) {
            return false;
        } else if ((item.amazon.last_fetch) && (new Date(item.amazon.last_fetch).getTime() + (3600000 * 12) > Date.now())) {
            return false;
        } else {
            return true;
        }*/
    }

    static FormatAmazonItem(items) {

        if (!items || items.length === 0) return [];
        let _tmp = [];

        items.forEach(function(item) {
            if (item.LargeImage) {
                _tmp.push({
                    ImageUrl: item.LargeImage[0].URL[0],
                    ItemAttributes: {
                        Brand: item.ItemAttributes.Brand,
                        Feature: item.ItemAttributes.Feature,
                        ListPrice: item.ItemAttributes.ListPrice
                    },
                    DetailPageURL: item.DetailPageURL,
                    ItemLinks: item.ItemLinks
                })
            }
        })
        return _tmp;
    }

    static GetThumbnailFromAmazon(items) {
        if (!items || items.length === 0) return undefined;
        return items[0].SmallImage[0].URL[0] || items[0].MediumImage[0].URL[0] || items[0].LargeImage[0].URL[0];
    }

    static LoadTopItems() {
        let promise = new Promise(function(resolve, reject) {
            Item
                .find({})
                .sort('visits', -1)
                .populate('category')
                .limit(30)
                .select('category label')
                .exec(function(err, items) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                })
        })

        return promise;
    }

    static LoadItemsByQuery(query) {
        let promise = new Promise(function(resolve, reject) {
            Item
                .find(query, 'category label', {
                    sort: {
                        visits: -1
                    },
                    limit: 5,
                    populate: 'category'
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

    static getUserRate(user, rates) {
        if ((!user) || (!rates.length)) return undefined;
        let rate = rates.filter((rate) => rate.user.equals(user._id));
        rate = rate[0];
        if (rate && rate.value) {
            return rate.value;
        } else {
            return undefined;
        }
    }

}

module.exports = ItemsHelper;