'use strict';

const mongoose = require('mongoose');
const User = mongoose.model('User');


class SettingsHelper {


	static updateAdminPassword(userId, data) {

		let promise = new Promise(function(resolve, reject) {
			User.findById(userId, function(err, user) {
				if (err) {
					reject(err)
				} else {
					// check if the old password match
					// check if new password eq confirm password
					if (user.validPassword(data.old_password) && data.new_password === data.confirm_password) {
						user.local.password = data.new_password;
						user.save(function(err, user) {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						})
					} else {
						reject('Password doesnt match');
					}

				}
			})
		})
		return promise;
	}

}

module.exports = SettingsHelper;