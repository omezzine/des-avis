'use strict';

const CarQueryHelper = rootRequire('app/helpers/carQuery');

class CarQueryController {

    index(req, res) {
    	CarQueryHelper.FetchCars().then(function(data) {
    		console.log(data);
    	})
    }

    // Listing
    run(req, res) {
        // query params
    }


}

module.exports = new CarQueryController();