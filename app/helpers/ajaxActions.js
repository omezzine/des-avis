'use strict';
const mongoose = require('mongoose');
const Item = mongoose.model('Item');

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
                        reject(err);
                    } else {
                        resolve(items);
                    }
                })
        })
        return promise;
    }

    /*static search(query) {
        const OPTS = {
            suggest: {
                "label-suggest": {
                    "text": "?" + query + "?",
                    "completion": {
                        "field": "label",
                        "fuzzy": {
                            "fuzziness": 2
                        }
                    }
                }
            },
            hydrate: true,
            size: 1,
            from: 10
        };
        const Q = {
            "match": {
                "label": "*" + query + "*"
            }
        }
        let promise = new Promise(function(resolve, reject) {
            Item.search(null, OPTS, function(err, items) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(JSON.stringify(items))
                    resolve(items['suggest']['label-suggest'][0].options);
                }
            })
        })
        return promise;
    } */


}

module.exports = AjaxActionsHelper;