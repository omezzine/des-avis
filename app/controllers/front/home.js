'use strict';

const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const ItemsHelpers = rootRequire('app/helpers/items');
const CategoriesHelper = rootRequire('app/helpers/categories');
const CommentsHelper = rootRequire('app/helpers/comments');

class HomeController {

    index(req, res) {
        let itemsCountPromise = ItemsHelpers.GetItemsCount();
        let commentsCountPromise = CommentsHelper.GetCommentsCount();
        let categoriesPromise = CategoriesHelper.LoadAllCategories({}, {
            grouped: true
        });
        
        Promise.all([categoriesPromise, itemsCountPromise, commentsCountPromise]).then(function(values) {
            return res.render('front/home', {
                categories: values[0],
                itemsCount: values[1],
                commentsCount: values[2],
                two_columns: false,
                ShowSearchBar: false
            });
        })
    }

    listByCategory(req, res, next) {
        let page = req.query.page || 1;
        let itemsPromise = ItemsHelpers.LoadAllByCategory(req.params.category, page);
        let categoriesPromise = CategoriesHelper.LoadAllCategories({}, {
            grouped: true
        });

        Promise.all([itemsPromise, categoriesPromise]).then(function(values) {
            console.log(itemsPromise)
            res.render('front/listing', {
                categorySlug: req.params.category,
                items: values[0].docs,
                items_pages: values[0].pages,
                item_current_page: values[0].page,
                categories: values[1],
                two_columns: true

            })
        }, function(err) {
            next(new Error('404 not found'));
        })
    }

}

module.exports = new HomeController();