var config = {
    host: 'http://localhost:7000',
    mongodb_host: 'mongodb://127.0.0.1/testx',
    mail_transport: {
        service: 'Gmail',
        auth: {
            user: 'info.enterpriseapps@gmail.com',
            pass: 'trello2015'
        }
    },
    generateMail: function (recipient, key) {
        return {
            from: '"EnterpriseApps" <info.enterpriseapps@gmail.com>',
            to: recipient,
            subject: 'Online Point of Sale System Sign Up',
            text: 'Hello,\n\nyou have recently registered an account on Online Point of Sale System.\n'
                    + 'Please visit the following link to complete your registration.\n\n'
                    + config.host + '/activate?key=' + key
                    + '\n\nBest regards,\nOnline Point of Sale System Team',
            html: '<p>Hello,<br><br>you have recently registered an account on Online Point of Sale System.<br> '
                    + 'Please visit the following link to complete your registration.<br><br>'
                    + '<a href="' + config.host + "/validate?key=" + key + '">' + config.host + '/validate?key=' + key + '</a>'
                    + '<br><br>Best regards,<br>Online Point of Sale System Team</p>'
        };
    }
};

module.exports = config;
