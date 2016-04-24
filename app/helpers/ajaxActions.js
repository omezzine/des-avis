'use strict';

const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const AmazonHelper = rootRequire('app/helpers/amazon');
const logger = rootRequire('config/logger');

class AjaxActionsHelper {

    static search(query) {
        let promise = new Promise(function(resolve, reject) {
            Item.find({
                label: {
                    $regex: query,
                    $options: "i"
                }
            })
                .populate('category', 'label slug -_id')
                .select('label slug category rate brand thumbnail')
                .lean()
                .exec(function(err, items) {
                    if (err) {
                        logger.error(err);
                        reject([]);
                    } else {
                        if (items.length) {
                            resolve(items);
                        } else {
                            // No Result Found 
                            // We Search on Amazon
                            AjaxActionsHelper.amazonSearch(query).then(function(items) {
                                resolve(items);
                            }, function(err) {
                                logger.error(err);
                                reject([]);
                            });
                        }

                    }
                })
        })
        return promise;
    }

    static amazonSearch(query) {
        let promise = new Promise(function(resolve, reject) {
            AmazonHelper.AmazonQuickSearch(query).then(function(items) {
                resolve(items);
            }, function(err) {
                logger.error(err);
                reject(err);
            });
        })
        return promise;
    }


}

module.exports = AjaxActionsHelper;