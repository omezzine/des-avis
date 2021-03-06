'use strict';

const errorHelper = require('mongoose-error-helper').errorHelper;

class Utils {

    static FormatErrors(erros) {

        if (typeof errors === "string") {
            return [errors];
        }
        /* const keys = Object.keys(errors)
	    var errs = []

	    // if there is no validation error, just display a generic error
	    if (!keys) {
	        return ['Oops! There was an error']
	    }

	    keys.forEach(function(key) {
	        if (errors[key]) errs.push(errors[key].message)
	    })

	    return errs */
        return errorHelper(erros);
    }

    static SetUndefinedIfEmpty(string) {
        if (!string || string.trim() === "" || string === null) {
            return undefined;
        } else {
            return string;
        }
    }

    static CreateSortObject(params) {
        let sort = {};
        if (params.sort_by) {
            sort[params.sort_by] = params.order || 1;
        }
        return sort;
    }

    static DeleteNullPropertiesFromObject(obj, recurse) {
        for (let key in obj) {
            if (typeof obj[key] === "undefined") {
                delete obj[key];
            } else if (recurse && typeof obj[key] === 'object') {
                for (let _key in obj[key]) {
                    if (typeof obj[key][_key] === "undefined") {
                        delete obj[key][_key];
                    }
                }

                if (Object.keys(obj[key]).length === 0) delete obj[key];
            }
        }
        return obj;
    }

}





module.exports = Utils;