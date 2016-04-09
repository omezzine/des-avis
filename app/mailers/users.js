'use strict';

const smtpTransport = rootRequire('config/smtpTransport');

class UsersMailer {

    static ForgotPassword(host, email, token) {
        smtpTransport.sendMail({
            from: "noreply@des-avis.fr",
            to: "mohamed.omezzine@gmail.com",
            subject: "des-avis.fr - Mot de passe oublié ?",
            html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Veuillez cliquer sur le lien suivant:\n\n' +
                '<a target="_blank" href="http://' + host + '/auth/reset/' + token + '">Lien</a>\n\n' +
                '<span style="color:red">If you did not request this, please ignore this email and your password will remain unchanged</span>.\n'
        }, function(err, info) {
            if (err) {
               console.log(err);
            } else {
                console.log('Message sent: ' + info.response);
            }
            smtpTransport.close();
        });

    }

}


module.exports = UsersMailer;