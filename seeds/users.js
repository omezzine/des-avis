const mongoose = require('mongoose');
const User = mongoose.model('User');

User.findOne({
    role: 'Admin'
}, function(err, user) {
    if (!err && !user) {
        var user = new User({
            local: {
                email: "mohamed.omezzine@gmail.com",
                password: 123456
            },
            role: "Admin",
            provider: "local",
            birthday: 667695600000
        });
        user.save(function(err) {
            if (err) {
                console.log(err);
            }
        });
    }
});