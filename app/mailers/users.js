'use strict';

const smtpTransport = rootRequire('config/smtpTransport');

class UsersMailer {

    static ForgotPassword(host, email, token) {
        smtpTransport.sendMail({
            from: "noreply@des-avis.fr",
            to: "mohamed.omezzine@gmail.com",
            subject: "Des-avis.fr: Mot de passe oublié ?",
            html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                '<a target="_blank" href="http://' + host + '/auth/reset/' + token + '">link</a>\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }, function(err, info) {
            if (err) {
               onsole.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
            smtpTransport.close();
        });

    }

}


module.exports = UsersMailer;