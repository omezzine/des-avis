/**
 * @model Item
 */

'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosastic = require('mongoosastic');
const mongoosePaginate = require('mongoose-paginate');
const getSlug = require('speakingurl');

var ItemSchema = new Schema({
    label: {
        type: String,
        required: true,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    slug: {
        type: String
    },
    approuved: {
        type: Boolean,
        default: false
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    rates: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        value: Number
    }],
    rate: Number,
    thumbnail: String,
    amazon: {
        last_fetch: {
            type: Date
        },
        more_results: {
            type: String
        },
        items: {
            type: Array,
        }
    },
    visits: {
        type: Number,
        default: 1
    },
    related_items: {
        last_check: Date,
        items: [{
            type: Schema.Types.ObjectId,
            ref: 'Item'
        }]
    },
    provider: {
        enum: ['Amazon', 'Local'],
        type: String,
        default: 'Local'
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



// pagination
ItemSchema.plugin(mongoosePaginate);


// Run Every Time Before Save
ItemSchema.pre('save', function(next) {

    let item = this;
    // Generate Slug
    item.slug = getSlug(item.label, {
        lang: 'fr'
    });

    // Set UpdateAt To Now
    item.updated_at = Date.now();
    // Next
    next();
});

// Set Model Item
var ITEM = mongoose.model('Item', ItemSchema);