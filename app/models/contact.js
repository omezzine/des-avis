/**
 * @model Contact
 */

'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var ContactSchema = new Schema({
    text: {
        type: String,
        required: true,
        min: 5,
    },
    viewed: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    recieved_at: {
        type: Date,
        default: Date.now()
    }
});

// Set Model Contact
mongoose.model('Contact', ContactSchema);