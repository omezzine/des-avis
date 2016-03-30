/**
 * @model Category
 */

'use strict';

/**
 * Module dependencies.
 */
const getSlug = require('speakingurl');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CategorySchema = new Schema({
    label: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    amazon_label: String,
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
});


CategorySchema.pre('save', function(next) {
    let cat = this;
    // Set UpdateAt To Now
    cat.updated_at = Date.now();
    // Set Slug
    cat.slug = getSlug(cat.label, {
        lang: 'fr'
    });
    // Next
    next();
});





// Set Model Category
mongoose.model('Category', CategorySchema);