var config = {
    host: 'http://localhost:7000',
    mongodb_host: 'mongodb://127.0.0.1/testx',
    //mongodb_host: 'mongodb://tester:suchpass@waffle.modulusmongo.net:27017/ep2Ubebu',
    
    // when changing mail service, follow the EAUTH instructions from the service provider
    mail_transport: {
        service: 'Gmail',
        auth: {
            user: 'info.enterpriseapps@gmail.com',
            pass: 'trello2015'
        }
    },
    generateSignupMail: function (recipient, key) {
        return {
            from: '"EnterpriseApps" <info.enterpriseapps@gmail.com>',
            to: recipient,
            subject: 'Sign Up - Online Point of Sale System',
            text: 'Hello,\n\nyou have recently registered an account on Online Point of Sale System.\n'
                    + 'Please visit the following link to complete your registration.\n\n'
                    + config.host + '/activate?key=' + key
                    + '\n\nBest regards,\nOnline Point of Sale System Team',
            html: '<p>Hello,<br><br>you have recently registered an account on Online Point of Sale System.<br>'
                    + 'Please visit the following link to complete your registration.<br><br>'
                    + '<a href="' + config.host + "/activate?key=" + key + '">' + config.host + '/activate?key=' + key + '</a>'
                    + '<br><br>Best regards,<br>Online Point of Sale System Team</p>'
        };
    },
    generateForgotMail: function (recipient, key, token) {
        return {
            from: '"EnterpriseApps" <info.enterpriseapps@gmail.com>',
            to: recipient,
            subject: 'Password Reset - Online Point of Sale System',
            text: 'Hello,\n\nyou have recently requested for a password reset.\n'
                    + 'Please visit the following link to complete the process.\n\n'
                    + config.host + '/resetpassword?key=' + key
                    + '\n\nIf you don\'t recall doing this, you can safely ignore this message.'
                    + '\n\nBest regards,\nOnline Point of Sale System Team',
            html: '<p>Hello,<br><br>you have recently requested for a password reset.<br>'
                    + 'Please visit the following link to complete the process.<br><br>'
                    + '<a href="' + config.host + "/passwordreset?key=" + key + '&token=' + token + '">' + config.host + '/passwordreset?key=' + key + '&token=' + token + '</a>'
                    + '<br><br>If you don\'t recall doing this, you can safely ignore this message.</p>'
                    + '<br><br>Best regards,<br>Online Point of Sale System Team</p>'
        };
    }
};

module.exports = config;
