var config = require('../config');
var utils = require('../utils');
var router = require('express').Router();
var Users = require('../models/Users');
var Buttons = require('../models/Buttons');
var Settings = require('../models/Settings');
var Catalogs = require('../models/Catalogs');
var Sales = require('../models/Sales');
var ObjectID = require('mongodb').ObjectID;

// Check incoming request. Request must obey the same regex rules on the client
function isValidSignupRequest(request) {
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
;
router.post('/signup', function (req, res) {
    var newEmail = req.body.email.toLowerCase();
    Users.findOne({email: {$regex: new RegExp('^' + newEmail + '$', 'i')}}, function (err, user) {
        if (user) {
            res.json({success: false, msg: 'Account ' + newEmail + ' is already registered'});
        } else if (!isValidSignupRequest(req.body)) {
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
                utils.mailer.sendMail(config.generateSignupMail(newEmail, newUserId.valueOf()), function (error, info) {
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
        password_pending: "no"
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
                number: 0,
                role: "Admin",
                name: "Admin",
                pin: "0000"
            }
        ]
    };
}
;
function generateDefaultButtons(newUserId) {
    return {
        userId: newUserId,
        saleGroups: [
            {
                tax: 15,
                group: "Food",
                bg: "DF5441",
                text: "Food 15"
            },
            {
                tax: 15,
                group: "Food",
                bg: "D34B57",
                text: "Food 21"
            },
            {
                tax: 15,
                group: "Vegetable",
                bg: "334C60",
                text: "Vegetable"
            },
            {
                tax: 15,
                group: "Drinks",
                bg: "13A7CB",
                text: "Drinks"
            },
            {
                tax: 21,
                group: "Alcohol",
                bg: "01AA93",
                text: "Alcohol"
            },
            {
                tax: 21,
                group: "Tobacco",
                bg: "E65D65",
                text: "Tobacco"
            },
            {
                tax: 15,
                group: "Press",
                bg: "425B71",
                text: "Press"
            },
            {
                tax: 21,
                group: "Drugs",
                bg: "5B5B5B",
                text: "Drugs"
            },
            {
                tax: 15,
                group: "Uncategorized",
                bg: "996DB8",
                text: "Uncateg. 15"
            },
            {
                tax: 21,
                group: "Uncategorized",
                bg: "E4644B",
                text: "Uncateg. 21"
            }
        ],
        tabs: [
            {
                name: "Common",
                quickSales: [
                    {
                        bg: "334C60",
                        desc: "Black round bread baked in Czech",
                        tax: 15,
                        group: "Food",
                        price: "19.00",
                        text: "Brown Bread",
                        tags: [
                            "baked",
                            "whole"
                        ]
                    },
                    {
                        bg: "334C60",
                        desc: "A regular roll bread made in Czech",
                        tax: 15,
                        group: "Food",
                        price: "3.00",
                        text: "Roll Bread",
                        tags: [
                            "baked",
                            "wheat"
                        ]
                    },
                    {
                        bg: "334C60",
                        desc: "A common small white bread",
                        tax: 15,
                        group: "Food",
                        price: "3.00",
                        text: "Round Bread",
                        tags: [
                            "baked",
                            "wheat"
                        ]
                    },
                    {
                        bg: "334C60",
                        desc: "Baked butter flavored croissant",
                        tax: 15,
                        group: "Food",
                        price: "12.00",
                        text: "Croissant",
                        tags: [
                            "baked",
                            "wheat",
                            "sweet"
                        ]
                    },
                    {
                        bg: "334C60",
                        desc: "3.00 CZK for a beer bottle",
                        tax: 0,
                        group: "Uncategorized",
                        price: "3.00",
                        text: "Beer Bottle",
                        tags: [
                            "refund",
                            "bottle"
                        ]
                    },
                    {
                        bg: "334C60",
                        desc: "Refund 3.00 CZK for a beer bottle",
                        tax: 0,
                        group: "Uncategorized",
                        price: "-3.00",
                        text: "Refund Bottle",
                        tags: [
                            "refund",
                            "bottle"
                        ]
                    }
                ]
            },
            {
                name: "Beverages",
                quickSales: [
                    {
                        bg: "334C60",
                        desc: "Sample description",
                        group: "Food",
                        price: "17.00",
                        tags: [
                            "Demo",
                            "Sample"
                        ],
                        tax: 15,
                        text: "Sample"
                    }
                ]
            },
            {
                name: "Tab 3",
                quickSales: [
                    {
                        bg: "334C60",
                        desc: "Sample 3",
                        group: "Drinks",
                        price: "25.00",
                        tags: [
                            "Demo",
                            "Sample"
                        ],
                        tax: 21,
                        text: "Sample 3"
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
        articles: []
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
