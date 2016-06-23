var config = require('../config');
var template = require('../template');
var utils = require('../utils');
var router = require('express').Router();
var Users = require('../models/Users');
var Buttons = require('../models/Buttons');
var Settings = require('../models/Settings');
var Catalogs = require('../models/Catalogs');
var Sales = require('../models/Sales');
var ObjectID = require('mongodb').ObjectID;

router.post('/signup', function (req, res) {
    var newEmail = req.body.email.toLowerCase();
    var validator = {
        'email': utils.emailRegex,
        'password': /^.{8,128}$/,
        'name': /^.{3,100}$/,
        'tin': /^\d{8}$/,
        'vat': /^[A-Z]{2}\d{8,10}$/,
        'street': /^.{5,100}$/,
        'city': /^.{2,75}$/,
        'zip': /^\w{3,10}$/,
        'country': /^.{3,75}$/,
        'phone': /^\+?(\d{3})?\d{9}$/,
        'currency': /^\{"code":"(CZK)","symbol":"(Kč)"\}$/
                //[ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ\w]{1,5}
    };
    Users.findOne({email: {$regex: new RegExp('^' + newEmail + '$', 'i')}}, function (err, user) {
        if (user) {
            res.json({success: false, msg: 'Account ' + newEmail + ' is already registered'});
        } else if (!utils.isValidRequest(validator, req.body)) {
            res.json({success: false, msg: 'Invalid request'});
        } else {
            var newUserId = new ObjectID();
            var newUser = new Users(generateNewUser(newUserId, newEmail, req.body.password));
            var newSettings = new Settings(generateDefaultSettings(newUserId, req.body));
            var newButtons = new Buttons(generateDefaultButtons(newUserId));
            var newCatalog = new Catalogs(generateDefaultCatalog(newUserId));
            var newSales = new Sales(generateDefaultSales(newUserId));
            newUser.save().then(function (s) {
                console.log('User     created: ' + s._id);
                return newSettings.save();
            }).then(function (s) {
                console.log('Settings created: ' + s.userId);
                return newButtons.save();
            }).then(function (s) {
                console.log('Buttons  created: ' + s.userId);
                return newCatalog.save();
            }).then(function (s) {
                console.log('Catalog  created: ' + s.userId);
                return newSales.save();
            }).then(function (s) {
                console.log('Sales    created: ' + s.userId);
                utils.mailer.sendMail(template.generateSignupMail(newEmail, newUserId.valueOf()), function (error, info) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Sign Up Message sent to ' + newEmail + ': ' + info.response);
                    res.json({
                        success: true,
                        msg: newEmail
                    });
                });
            }).catch(function (err) {
                console.log(err);
                console.log('Reverting mongoose saves...');
                Users.findOneAndRemove({_id: newUserId}).exec().then(function () {
                    console.log('User     removed: ' + newUserId);
                    return Settings.findOneAndRemove({userId: newUserId}).exec();
                }).then(function () {
                    console.log('Settings removed: ' + newUserId);
                    return Buttons.findOneAndRemove({userId: newUserId}).exec();
                }).then(function () {
                    console.log('Buttons  removed: ' + newUserId);
                    return Catalogs.findOneAndRemove({userId: newUserId}).exec();
                }).then(function () {
                    console.log('Catalog  removed: ' + newUserId);
                    return Sales.findOneAndRemove({userId: newUserId}).exec();
                }).then(function () {
                    console.log('Sales    removed: ' + newUserId);
                    res.json({
                        success: false,
                        msg: err
                    });
                    console.log('Reverted mongoose saves...');
                }).catch(function (err) {
                    console.log(err);
                });
            });
        }
    });
});

module.exports = router;


// defaults
function generateNewUser(newUserId, newEmail, password) {
    return {
        _id: newUserId,
        email: newEmail,
        password: utils.hash(password),
        activated: false,
        password_pending: "no"/*,
         session_token: "no"*/
    };
}
;
function generateDefaultSettings(newUserId, request) {
    return {
        userId: newUserId,
        tin: request.tin,
        vat: request.vat,
        name: request.name,
        address: {
            street: request.street,
            city: request.city,
            zip: request.zip,
            country: request.country
        },
        phone: request.phone,
        currency: JSON.parse(request.currency),
        tax_rates: [
            0,
            10,
            15,
            21
        ],
        staff: [
            {
                role: "Admin",
                number: 0,
                name: "Admin",
                pin: "0000"
            }
        ],
        receipt: {
            header: "Your receipt",
            footer: "Thank you for stopping by!"
        }
    };
}
;
function generateDefaultButtons(newUserId) {
    return {
        userId: newUserId,
        saleGroups: [
            {
                tax: 15,
                group: "Food 15",
                bg: "DF5441"
            },
            {
                tax: 15,
                group: "Food 21",
                bg: "D34B57"
            },
            {
                tax: 15,
                group: "Vegetable",
                bg: "334C60"
            },
            {
                tax: 15,
                group: "Drinks",
                bg: "13A7CB"
            },
            {
                tax: 21,
                group: "Alcohol",
                bg: "01AA93"
            },
            {
                tax: 21,
                group: "Tobacco",
                bg: "E65D65"
            },
            {
                tax: 15,
                group: "Press",
                bg: "425B71"
            },
            {
                tax: 21,
                group: "Drugs",
                bg: "5B5B5B"
            },
            {
                tax: 15,
                group: "Misc 15",
                bg: "996DB8"
            },
            {
                tax: 21,
                group: "Misc 21",
                bg: "E4644B"
            }
        ],
        tabs: [
            {
                name: "Common",
                quickSales: [
                    {
                        ean: "0",
                        bg: "334C60"
                    },
                    {
                        ean: "1",
                        bg: "334C60"
                    },
                    {
                        ean: "2",
                        bg: "334C60"
                    },
                    {
                        ean: "3",
                        bg: "334C60"
                    },
                    {
                        ean: "4",
                        bg: "334C60"
                    }
                ]
            },
            {
                name: "Beverages",
                quickSales: [
                    {
                        ean: "5",
                        bg: "334C60"
                    },
                    {
                        ean: "6",
                        bg: "334C60"
                    }
                ]
            },
            {
                name: "Trending",
                quickSales: [
                    {
                        ean: "7",
                        bg: "334C60"
                    }
                ]
            }
        ]
    };
}
;
function generateDefaultCatalog(newUserId) {
    return {
        userId: newUserId,
        articles: [
            {
                ean: "0",
                name: "Sample 0",
                price: "14.00",
                group: "Grouper",
                tax: 21
            },
            {
                ean: "1",
                name: "Sample 1",
                price: "33.00",
                group: "Grouper",
                tax: 0
            },
            {
                ean: "2",
                name: "Sample 2",
                price: "29.00",
                group: "Grouper",
                tax: 10
            },
            {
                ean: "3",
                name: "Sample 3",
                price: "30.00",
                group: "Grouper",
                tax: 10
            },
            {
                ean: "4",
                name: "Sample 4",
                price: "99.00",
                group: "Grouper",
                tax: 21
            },
            {
                ean: "5",
                name: "Sample 5",
                price: "139.00",
                group: "Grouper",
                tax: 10
            },
            {
                ean: "6",
                name: "Sample 6",
                price: "3.00",
                group: "Grouper",
                tax: 10
            },
            {
                ean: "7",
                name: "Sample 7",
                price: "9.00",
                group: "Sample 8",
                tax: 21
            }
        ]
    };
}
;
function generateDefaultSales(newUserId) {
    return {
        userId: newUserId,
        receipts: []
    };
}
;
