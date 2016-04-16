const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const data = require('./data/categories');

Category.findOne({}, function(err, category) {
    if (!err && !category) {
        Category.create(data, function(err, categories) {
            if (err) {
                console.log(err);
            } else {
                console.log(categories.length + ' categories has been created');
            }
        })
    }
});