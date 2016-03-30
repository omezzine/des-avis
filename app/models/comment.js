/**
 * @model Comment
 */

'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

var CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
        min: 5,
        max: 240
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    anonymous: {
        type: Boolean,
        default: false
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    sub_comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item'
    },
    votes_count: {
        type: Number,
        default: 0
    },
    votes: {
        type: Array
    },
    spams_count: {
        type: Number,
        default: 0 
    },
    spams: {
        type: Array
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
});




CommentSchema.pre('save', function(next) {
    this.wasNew = this.isNew; // check if new
    this.votes_count = this.votes.length;
    this.spams_count = this.spams.length;
    next();
});

// After Save
CommentSchema.post('save', function(comment, next) {
    if (this.wasNew) {
        if (comment.item) { 
            // If Comment is on item
            let Item = mongoose.model('Item');
            Item.findByIdAndUpdate(comment.item, {
                $push: {
                    comments: comment._id
                }
            }, {
                safe: true,
                upsert: true,
                new: true
            }, function(err, item) {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            })
        } else {
            // Comment is a sub comment
            let Comment = mongoose.model('Comment');
            Comment.findByIdAndUpdate(comment.parent, {
                $push: {
                    sub_comments: comment._id
                }
            }, {
                safe: true,
                upsert: true,
                new: true
            }, function(err, item) {
                if (err) {
                    next(err);
                } else {
                    next();
                }
            })
        }
    } else {
        next();
    }

});

// pagination
CommentSchema.plugin(mongoosePaginate);

// Set Model Comment
mongoose.model('Comment', CommentSchema);