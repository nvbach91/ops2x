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
            } else {
                if (typeof validator[validKeys[i]] === 'function') { // if the validator field requires a fuction to validate
                    return validator[validKeys[i]](request[validKeys[i]]);
                } else if (!validator[validKeys[i]].test(request[testKeys[i]])) {
                    return false;
                }
            }
        }
        return true;
    },
    sortByEAN: function (a, b) {
        return a.ean < b.ean ? -1 : 1;
    },
    binaryIndexOf: function (array, field, needle) {
        var minIndex = 0;
        var maxIndex = array.length - 1;
        var currentIndex;
        var currentElement;

        while (minIndex <= maxIndex) {
            currentIndex = (minIndex + maxIndex) / 2 | 0;
            currentElement = array[currentIndex];

            if (currentElement[field] < needle) {
                minIndex = currentIndex + 1;
            }
            else if (currentElement[field] > needle) {
                maxIndex = currentIndex - 1;
            }
            else {
                return currentIndex;
            }
        }

        return -1;
    },
    binaryInsert: function (value, array, compareField, startVal, endVal) {

        var length = array.length;
        var start = typeof (startVal) !== 'undefined' ? startVal : 0;
        var end = typeof (endVal) !== 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
        var m = start + Math.floor((end - start) / 2);

        if (length === 0) {
            array.push(value);
            return;
        }

        if (value[compareField] > array[end][compareField]) {
            array.splice(end + 1, 0, value);
            return;
        }

        if (value[compareField] < array[start][compareField]) {//!!
            array.splice(start, 0, value);
            return;
        }

        if (start >= end) {
            return;
        }

        if (value[compareField] < array[m][compareField]) {
            utils.binaryInsert(value, array, compareField, start, m - 1);
            return;
        }

        if (value[compareField] > array[m][compareField]) {
            utils.binaryInsert(value, array, compareField, m + 1, end);
            return;
        }
    },
    convertJsonCatalogToCSV: function (articles) {
        var res = "ean;name;price;group;tax";
        for (var i = 0; i < articles.length; i++) {
            var a = articles[i];
            res += "\n" + a.ean + ";" + a.name + ";" + a.price + ";" + a.group + ";" + a.tax;
        }
        return res;
    }
};

module.exports = utils;
