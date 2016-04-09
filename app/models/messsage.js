/**
 * @model Contact
 */

'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');


let MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    object: {
        type: String,
        required: true
    },
    viewed: {
        type: Boolean,
        default: false
    },
    from: {
        type: String,
        required: true
    },
    sent_at: {
        type: Date
    },
    replied: {
        type: Boolean,
        default: false
    },
    replied_at: {
        type: Date
    },
    replied_text: {
        type: String
    }
});

// pagination
MessageSchema.plugin(mongoosePaginate);

MessageSchema.pre('save', function(next) {
    this.wasNew = this.isNew; // check if new
    if (this.isNew) {
      this.sent_at = Date.now();  
    }
    next();
});

// Set Model Contact
mongoose.model('Message', MessageSchema);

