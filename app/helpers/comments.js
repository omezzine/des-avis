'use strict';

const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const async = require('async');
const _ = require('lodash');
const User = mongoose.model('User');
const Redis = rootRequire('config/redis');
const COUNT_CACHE_TIME = 1 * 60 * 60 * 6; // 6 hours
class CommentsHelper {


    static GetCommentsCount() {
        const CACHE_NAME = "comments_count";
        let promise = new Promise(function(resolve, reject) {
            Redis.get(CACHE_NAME, function(err, data) {
                if (err || !data) {
                    Comment.find({})
                        .lean()
                        .count()
                        .exec(function(err, count) {
                            if (err) {
                                resolve(0)
                            } else {
                                Redis.set(CACHE_NAME, count);
                                Redis.expire(CACHE_NAME, COUNT_CACHE_TIME);
                                resolve(count);
                            }

                        });
                } else {
                    resolve(data);
                }

            })
        })
        return promise;
    }

    static LoadById(id) {
        console.log(id);
        let promise = new Promise(function(resolve, reject) {
            Comment
                .findById(id)
                .populate('owner')
                .populate('sub_comments')
                .exec(function(err, comment) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(comment);
                    }
                });
        })
        return promise;
    }

    static LoadAllCommentsByItem(itemId, page) {
        let promise = new Promise(function(resolve, reject) {
            Comment.paginate({
                item: itemId
            }, {
                limit: 15,
                lean: false,
                sort: {
                    votes_count: -1,
                    created_at: 1,
                },
                page: page || 1,
                populate: ['sub_comments', 'owner']
            }, function(err, comments) {
                if (err) {
                    reject(err);
                } else {
                    var data = [];
                    async.forEach(comments.docs, function(_comment, callback) {
                        User.populate(_comment.sub_comments, {
                            'path': 'owner'
                        }, function(err, output) {
                            if (err) {
                                console.log(err);
                                callback();
                            } else {
                                _comment.sub_comments = output;
                                data.push(_comment);
                                callback();
                            }

                        })
                    }, function(err) {
                        if (err) {
                            console.log(err)
                        }
                        comments.docs = _.orderBy(data, ['votes_count', 'sub_comments.length', 'created_at'], ['desc', 'desc', 'asc']);;
                        resolve(comments);
                    });

                }
            });
        })
        return promise;
    }

    static LoadSignaledComments(page) {
        let promise = new Promise(function(resolve, reject) {
            Comment.paginate({
                spams_count: {
                    $gt: 0
                }
            }, {
                limit: 15,
                sort: {
                    spams_count: 'desc',
                    created_at: 'asc'
                },
                page: page || 1,
                populate: ['owner', 'sub_comments']
            }, function(err, comments) {
                if (err) {
                    reject(err);
                } else {
                    resolve(comments);
                }
            });
        })
        return promise;
    }

    static LoadCommentById(id) {
        let promise = new Promise(function(resolve, reject) {
            Comment.findById(id)
                .populate('owner')
                .populate('sub_comments')
                .exec(function(err, comment) {
                    if (err) {
                        reject(err);
                    } else {
                        User.populate(comment.sub_comments, {
                            'path': 'owner'
                        }, function(err, output) {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                comment.sub_comments = output;
                                resolve(comment);
                            }

                        })
                    }
                })
        })
        return promise;
    }

    static AddComment(user, anonymous, text, item_id) {

        let promise = new Promise(function(resolve, reject) {
            let comment = new Comment({
                text: text,
                item: item_id,
                owner: user.id,
                anonymous: anonymous || false
            });

            comment.save(function(err, comment) {
                if (err) {
                    reject(err);
                } else {
                    CommentsHelper.LoadCommentById(comment.id).then(function(new_comment) {
                        resolve(new_comment);
                    }, function(err) {
                        reject(err);
                    })
                }
            });
        });

        return promise;
    }

    static addSubComment(user, text, parent_comment) {

        let promise = new Promise(function(resolve, reject) {
            let comment = new Comment({
                text: text,
                parent: parent_comment,
                owner: user.id
            });

            comment.save(function(err, comment) {
                if (err) {
                    reject(err);
                } else {
                    Comment.populate(comment, 'owner', function(err, comment) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(comment);
                        }
                    })
                }
            });
        });

        return promise;
    }

    static Like(userId, comment_id) {
        let promise = new Promise(function(resolve, reject) {
            Comment.findById(comment_id, function(err, comment) {
                if (err || !comment) {
                    reject(err);
                } else {
                    let index = comment.votes.indexOf(userId);
                    if (index === -1) {
                        comment.votes.push(userId);
                    } else {
                        comment.votes.splice(index, 1);
                    }
                    comment.save();
                    resolve({
                        likes: comment.votes.length,
                        liked: !(~index)
                    });
                }
            })
        });
        return promise;
    }


    static DeleteComment(userId, comment_id) {
        let promise = new Promise(function(resolve, reject) {
            Comment.findById(comment_id, function(err, comment) {
                if (err || !comment) {
                    reject(err);
                } else {
                    if (String(comment.owner) === String(userId)) {
                        comment.remove(function(err, comment) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(comment);
                            }
                        });
                    } else {
                        reject('Unauthorized');
                    }
                }
            })
        });
        return promise;
    }

    static Signal(userId, comment_id) {
        let promise = new Promise(function(resolve, reject) {
            Comment.findById(comment_id, function(err, comment) {
                if (err || !comment) {
                    reject(err);
                } else {
                    let index = comment.spams.indexOf(userId);
                    if (index === -1) {
                        comment.spams.push(userId);
                    }
                    comment.save(function(err, comment) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(comment)
                        }
                    });

                }
            })
        });
        return promise;
    }


}


module.exports = CommentsHelper;