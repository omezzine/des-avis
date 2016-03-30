'use strict';

// Load Dependencies
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');


/**
 * Expose
 */

module.exports = nodemailer.createTransport(smtpTransport({
    host: APP_CONFIG.smtp.host,
    port: Number(APP_CONFIG.smtp.port),
    secureConnection: false,
    auth: {
        user: APP_CONFIG.smtp.user,
        pass: APP_CONFIG.smtp.pass
    }
}));