/**
 * @model User
 */
'use strict';

// Load Dependencies
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    role: {
        type: String,
        enum: ['User', 'Admin'],
        required: true,
        default: 'User'
    },
   sex: {
        enum: ['M', 'F'],
        type: String
   },
   local: {
        email: String,
        password: String,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    },
    gender: {
        type: String,
    },
    username: {
        type: String
    },
    email: {
        type: String
    },
    birthday: {
        type: Date 
    },
    facebook: {},
    google: {},
    provider: {
        type: String,
        required: true,
        enum: ['local', 'facebook', 'google']
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


// Run Every Time Before Save
UserSchema.pre('save', function(next) {
    let user = this;
    if (user.provider === "local") {
        // Generate Hash Password If New User Or Password Is Modified
        if (this.isModified('local.password') || this.isNew) {
            user.local.password = user.generateHash(user.local.password);
        }
    }
    // Set UpdateAt To Now
    user.updated_at = Date.now();
    // Next
    next();
});

// Create diplsay_name attribute
UserSchema.virtual('display_name').get(function () {
  return this.username || this.display_email.split('@')[0];
});

// Create diplsay_name attribute
UserSchema.virtual('display_email').get(function () {
  return this.email || this.local.email;
});

// Email Validation
/*UserSchema.path('local.email').validate(function(email) {
    let user = this;
    // If provider is not local so no need to validate email 
    if (user.provider !== "local") return true;
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email); // Assuming email has a text attribute
}, "path '{PATH}' field cannot be empty.")

// Password Validation
UserSchema.path('local.password').validate(function(password) {
    let user = this;
    // If provider is not local so no need to validate email 
    if (user.provider !== "local") return true;   
    return (password && (password.trim().length > 5));

}, "path '{PATH}' field cannot be empty.") */


// pagination
UserSchema.plugin(mongoosePaginate);

// Add Uniq validation plugin
UserSchema.plugin(uniqueValidator, {
    message: 'expected {PATH} to be unique.'
});


// Methods
UserSchema.methods = {

    /**
     * [generateHash generate password hash]
     * @param  {[String]} password
     * @return {[String]}
     */

    generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    /**
     * [validPassword return true if valid password]
     * @param  {[String]} password
     * @return {[Boolean]}
     */

    validPassword: function(password) {
        return bcrypt.compareSync(password, this.local.password);
    }

}

// Set Model User
mongoose.model('User', UserSchema);