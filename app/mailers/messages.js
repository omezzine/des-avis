'use strict';

const smtpTransport = rootRequire('config/smtpTransport');

class MessagesMailer {

    static Reply(email, text, answer) {
        smtpTransport.sendMail({
            from: "noreply@des-avis.fr",
            to: email,
            subject: "des-avis.fr - contact",
            html: '<p>'+answer+'</p>\n\n'+
                  '---------------------------------------\n\n'+
                  '<p>'+text+'</p>\n\n'
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


module.exports = MessagesMailer;