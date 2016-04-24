'use strict';

const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const ObjectId = mongoose.Schema.Types.ObjectId;
const _ = require('lodash');
const Utils = rootRequire('libs/utils');
const Redis = rootRequire('config/redis');
const redisDeletePattern = require('redis-delete-pattern');
const CACHE_TIME = 1 * 60 * 60 * 24 * 30; // 30 days

class CategoriesHelper {

    static LoadAllCategories(query, options) {
        options = options || {
            grouped: false
        }
        const CACHE_NAME = "categories" + JSON.stringify(query || {});
        let promise = new Promise(function(resolve, reject) {
            Redis.get(CACHE_NAME, function(err, data) {
                if (err || !data) {
                    // NO CACHE AVAILABLE
                    console.log('Creating categories cache')
                    Category.find(query || {})
                        .lean()
                        .exec(function(err, categories) {
                            if (err) {
                                reject(err);
                            } else {
                                Redis.set(CACHE_NAME, JSON.stringify(categories));
                                Redis.expire(CACHE_NAME, CACHE_TIME);
                                if (options.grouped) {
                                    resolve(CategoriesHelper.GroupCategories(categories));
                                } else {
                                    resolve(categories);
                                }

                            }
                        })
                } else {
                    // CACHE AVAILABLE
                    if (options.grouped) {
                        resolve(CategoriesHelper.GroupCategories(JSON.parse(data)));
                    } else {
                        resolve(JSON.parse(data));
                    }
                }
            })

        })
        return promise;
    }

    static GroupCategories(cats) {
        if (cats.length == 0) return cats;
        let parent_cats = _.filter(cats, function(el) {
            return !el.parent;
        });
        const sub_cats = _.filter(cats, function(el) {
            return el.parent;
        }) || [];
        parent_cats.forEach(function(cat) {
            cat.childrens = _.filter(sub_cats, function(el) {
                return (String(el.parent) == String(cat._id));
            });

        });
        return parent_cats;
    }


    static LoadCategoryById(id) {
        let promise = new Promise(function(resolve, reject) {
            Category.findById(id, function(err, category) {
                if (err) {
                    reject(err);
                } else {
                    resolve(category);
                }
            })
        })
        return promise;
    }

    static GetCategoryIdByAmazonLabel(label) {
        let promise = new Promise(function(resolve, reject) {
            CategoriesHelper.LoadAllCategories({}, {grouped: false}).then(function(categories) {
                let cat_id = categories.filter((cat) => (cat.amazon_label == label))[0]._id;
                resolve(cat_id);
            })
        })

        return promise;
    }

    static AddNewCategory(params) {
        let category = new Category({
            label: params.label,
            amazon_label: Utils.SetUndefinedIfEmpty(params.amazon_label),
            parent: Utils.SetUndefinedIfEmpty(params.parent_id)
        });


        let promise = new Promise(function(resolve, reject) {
            category.save(function(err, newCategory) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })

        return promise;
    }

    static UpdateCategory(cat) {
        let promise = new Promise(function(resolve, reject) {
            CategoriesHelper.LoadCategoryById(cat.id).then(function(category) {
                category.label = cat.label;
                category.parent = Utils.SetUndefinedIfEmpty(cat.parent);
                category.amazon_label = Utils.SetUndefinedIfEmpty(cat.amazon_label);
                category.save(function(err, cat) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
        });
        return promise;
    }

    static RemoveFromCache() {
        let promise = new Promise(function(resolve, reject) {
            redisDeletePattern({
                redis: Redis,
                pattern: 'categories*'
            }, function handleError(err) {
                if (err) {
                    console.log(err);
                }
                resolve();
            });
        });
        return promise;
    }

}

module.exports = CategoriesHelper;