'use strict';
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const AmazonHelper = rootRequire('app/helpers/amazon');

class AjaxActionsHelper {

    static search(query) {
        let promise = new Promise(function(resolve, reject) {
            Item.find({
                label: {
                    $regex: query,
                    $options: "i"
                }
            }).populate('category')
                .exec(function(err, items) {
                    if (err) {
                        console.log(err);
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
                                console.log(err);
                                reject([]);
                            });
                        }

                    }
                })
        })
        return promise;
    }

    static amazonSearch(query) {
        console.log('looking on amazon...');
        let promise = new Promise(function(resolve, reject) {
            AmazonHelper.AmazonQuickSearch(query).then(function(items) {
                resolve(items);
            }, function(err) {
                reject(err);
            });
        })
        return promise;
    }


}

module.exports = AjaxActionsHelper;