'use strict';

const Request = require('request');
const mongoose = require('mongoose');
const Item = mongoose.model('Item');
const CategoriesHelpers = rootRequire('app/helpers/categories');
const CarQyeryApiHost = "http://www.carqueryapi.com/api/0.3/";
const async = require('async');

class CarQueryHelper {

    static FetchCars() {
        let query = {
            //callback: '',
            cmd: 'getTrims',
            body: '',
            doors: '',
            drive: '',
            engine_type: '',
            fuel_type: '',
            keyword: '',
            min_cylinders: '',
            min_lkm_hwy: '',
            min_power: '',
            min_top_speed: '',
            min_torque: '',
            min_weight: '',
            min_year: '2015',
            max_cylinders: '',
            max_lkm_hwy: '',
            max_power: '',
            max_top_speed: '',
            max_torque: '',
            max_weight: '',
            max_year: '2015',
            seats: '',
            sold_in_us: '',
            full_results: 0,
            // _: 1461409916748
        };

        let promise = new Promise(function(resolve, reject) {
            let tmp = [];
            CarQueryHelper.GetMakersList().then(function(makers) {
                async.forEach(makers, function(maker_id, callback) {
                    query.make = maker_id;
                    Request({
                        url: CarQyeryApiHost,
                        qs: query,
                        json: true
                    }, function(err, response, body) {
                        if (body.Trims) {
                            body.Trims.forEach(function(car) {
                                _tmp.push({
                                    brand: car.make_display
                                })
                            })
                        }
                        setTimeout(function() {
                            callback();
                        }, 5000);

                    })
                }, function() {
                    resolve(tmp);
                })
            })
        })
        return promise;
    }

    static GetMakersList() {
        let query = {
            cmd: "getMakes"
        };

        let promise = new Promise(function(resolve, reject) {
            Request({
                url: CarQyeryApiHost,
                qs: query,
                json: true
            }, function(err, response, body) {
                let _tmp = [];
                if (body.Makes) {
                    body.Makes.forEach(function(maker) {
                        _tmp.push(maker.make_id);
                    })
                }
                resolve(_tmp.slice(1, 3));
            })
        })
        return promise;
    }


    static SaveCars(data) {
    	let promise = new Promise(function(resolve, reject) {
    		CategoriesHelpers.GetCategoryIdByLabel('automobile').then(function(cat_id) {
    			data.forEach((car) => {
    				car.category = cat_id
    			});
    			Item.save(data, function(err, data) {
    				if (err) {
    					reject(err);
    				} else {
    					resolve(data.length);
    				} 				
    			})
    		})
    	})
    	return promise;
    }



}

module.exports = CarQueryHelper;