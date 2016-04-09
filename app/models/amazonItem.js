/**
 * @model AmazonItem
 */

'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const uniqueValidator = require('mongoose-unique-validator');

var AmazonItemSchema = new Schema({
    label: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    thumbnail: String,
    search_provider: {
        enum: ['Auto', 'Smart'],
        type: String,
        default: 'Auto'
    },
    checked: {
        type: String,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

AmazonItemSchema.pre('save', function(next) {
    this.wasNew = this.isNew; // check if new
    if (this.isNew) {
      this.created_at = Date.now();  
    }
    this.updated_at = Date.now();
    next();
});

// Apply the pagination plugin
AmazonItemSchema.plugin(mongoosePaginate);

// Apply the uniqueValidator plugin 
AmazonItemSchema.plugin(uniqueValidator);

// Set Model Item
mongoose.model('AmazonItem', AmazonItemSchema);