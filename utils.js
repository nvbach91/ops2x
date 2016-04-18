var crypto = require('crypto');
var config = require('./config');
var nodemailer = require('nodemailer');

var utils = {
    emailRegex: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    hash: function (string) {
        return crypto.createHash('sha256').update(string).digest('hex');
    },
    isValidUsername: function (username) {
        if (['guest'].indexOf(username) >= 0) {
            return true;
        }
        return utils.emailRegex.test(username);
    },
    generateRandomString: function (length) {
        return crypto.randomBytes(length).toString('hex');
    },
    mailer: nodemailer.createTransport(config.mail_transport),
    // Check incoming request. Request must obey the same regex rules on the client
    isValidRequest: function (validator, request) {
        var validKeys = Object.keys(validator);
        var testKeys = Object.keys(request);
        if (validKeys.length !== testKeys.length) {
            return false;
        }
        for (var i = 0; i < validKeys.length; i++) {
            if (validKeys[i] !== testKeys[i]) {
                return false;
            } else if (!validator[validKeys[i]].test(request[testKeys[i]])) {
                return false;
            }
        }
        return true;
    }
};

module.exports = utils;
