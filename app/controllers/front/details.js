'use strict';

const ItemsHelper = rootRequire('app/helpers/items');
const CommentsHelper = rootRequire('app/helpers/comments');
const CategoriesHelper = rootRequire('app/helpers/categories');
const mongoose = require('mongoose');
const Item = mongoose.model('Item');

class DetailsController {

    // Render Details Page
    index(req, res, next) {

        ItemsHelper.findItemBySlug(req.params.slug).then(function(item) {

            let increasePromise = ItemsHelper.IncreaseVisits(item._id, req.session);
            let itemAmzonPromise = ItemsHelper.ItemAmazonSearch(item);
            let commentsPromise = CommentsHelper.LoadAllCommentsByItem(item._id, req.query.comment_page);
            let categoriesPromise = CategoriesHelper.LoadAllCategories({}, {grouped: true});
            let relatedItemsPromise = ItemsHelper.GetRelatedItems(item);

            Promise.all([increasePromise, itemAmzonPromise, commentsPromise, categoriesPromise, relatedItemsPromise]).then(function(values) {
                res.render('front/details', {
                    title: item.label,
                    item: item,
                    comments: values[2].docs,
                    comment_pages: values[2].pages,
                    comment_current_page: values[2].page,
                    categories: values[3],
                    related_items: values[4],
                    user_rate: ItemsHelper.getUserRate(req.user, item.rates),
                    two_columns: true
                });
            });


        }, function(err) {
            next(new Error('404 not found'));
        });
    }

}

module.exports = new DetailsController();