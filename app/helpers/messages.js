'use strict';

const mongoose = require('mongoose');
const Message = mongoose.model('Message');
const MessageMailer = rootRequire('app/mailers/messages');
const Utils = rootRequire('libs/utils');

class MessagesHelper {

	static LoadAll(query, page, limit) {
        query = Utils.DeleteNullPropertiesFromObject(query, true);
        let promise = new Promise(function(resolve, reject) {
            Message.paginate(query, {
                page: page,
                limit: limit
            }, function(err, messages) {
                if (err) {
                    reject(err);
                } else {
                    resolve(messages);
                }
            })
        })
        return promise;
    }

    static SaveMessage(data) {
    	let object = {
    		from: data.email,
    		text: data.text,
    		object: data.object

    	};
        let promise = new Promise(function(resolve, reject) {
        	let message = new Message(object);
        	message.save(function(err, message) {
        		if (err) {
        			reject(err);
        		} else {
        			resolve(message);
        		}
        	})
        });
        return promise;
    }

    static reply(messageId, text) {

        let promise = new Promise(function(resolve, reject) {
            Message.findById(messageId, function(err, message) {
                if (err) {
                    reject(err);
                } else {
                    message.replied_at = Date.now();
                    message.replied_text = text;
                    message.replied = true;
                    MessageMailer.Reply(message.from, message.text, text);
                    message.save(function(err, message) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                }
            })
        })

        return promise;
    }

}

module.exports = MessagesHelper;