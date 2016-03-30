'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');
const _ = require('lodash');
const crypto = require('crypto');

class UsersHelper {

    static LoadAllUsers(page, limit, sort) {
        console.log(sort);
        let promise = new Promise(function(resolve, reject) {
            User.paginate({}, {
                page: page,
                limit: limit,
                sort: sort
            }, function(err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
        })
        return promise;
    }


    static LoadUserById(id) {
        let promise = new Promise(function(resolve, reject) {
            User.findById(id, function(err, user) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            })
        })
        return promise;
    }

    static createAdmin(data) {
        let user = new User({
            role: 'Admin',
            provider: 'local',
            local: {
                email: data.email,
                password: data.password
            }
        });

        let promise = new Promise(function(resolve, reject) {
            user.save(function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve()
                }
            })
        })

        return promise;
    }

    static CreateUser(data) {
        console.log(data);
        let promise = new Promise(function(resolve, reject) {
            if (data.password !== data.confirm_password) {
                reject('Password Does not match');
            } else {
                let user = new User({
                    role: 'User',
                    provider: 'local',
                    sex: data.sex,
                    birthday: data.birthday,
                    local: {
                        email: data.email,
                        password: data.password
                    }
                });

                user.save(function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve()
                    }
                })
            }
        })

        return promise;
    }


    static UpdateUser(data) {
        let promise = new Promise(function(resolve, reject) {
            if ((data.password.length > 0) && (data.password !== data.confirm_password)) {
                reject('Password Does not match');
            } else {
                let options = {
                    sex: data.sex,
                    birthday: data.birthday,
                    local: {
                        email: data.email,
                    }
                };
                if ((data.password.length > 0)) {
                    options.local.password = data.password
                }
                User.update({
                    _id: data.id
                }, options, function(err, user) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve()
                    }
                })

            }
        })

        return promise;
    }

    static UpdateCategory(cat) {
        let promise = new Promise(function(resolve, reject) {
            CategoriesHelper.LoadCategoryById(cat._id).then(function(category) {
                category.label = cat.label;
                category.parent = cat.parent;
                category.save(function(err, cat) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(cat);
                    }
                })
            })
        });
        return promise;
    }

    static ForgotPassword(email) {
        let userPromise = new Promise(function(resolve, reject) {
            User.findOne({
                'local.email': email
            }, function(err, user) {
                if (err) {
                    reject(err);
                } else {
                    crypto.randomBytes(20, function(err, buf) {
                        if (err) {
                            reject(err);
                        } else {
                            var token = buf.toString('hex');
                            user.local.resetPasswordToken = token;
                            user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                            user.save(function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(token);
                                }
                            })
                        }
                    });
                }
            })
        })

        return userPromise;
    }

}

module.exports = UsersHelper;