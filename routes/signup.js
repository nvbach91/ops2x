var config = require('../config');

var router = require('express').Router();
var crypto = require('crypto');
var Users = require('../models/Users');
var Buttons = require('../models/Buttons');
var Settings = require('../models/Settings');
var Catalogs = require('../models/Catalogs');
var Sales = require('../models/Sales');
var ObjectID = require('mongodb').ObjectID;

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "info.enterpriseapps@gmail.com",
        pass: "trello2015"
    }
});

function isValidUsername(username) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(username);
}
;

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
;

router.post('/signup', function (req, res) {
    var email = req.body.email;
    Users.findOne({email: email}, function (err, user) {
        if (user) {
            res.json({success: false, msg: "Account <strong>" + email + "</strong> already exists"});
        } else {
            var errors = [];
            var newUserId = new ObjectID();
            var newUser = new Users({
                _id: newUserId,
                email: email,
                password: hash(req.body.password),
                validated: false
            });

            newUser.save(function (err) {
                if (err) {
                    errors.push(err);
                }
            }).then(function () {
                var newSettings = new Settings(generateDefaultSettings(newUserId, req.body));
                newSettings.save(function (err) {
                    if (err) {
                        errors.push(err);
                    }
                });
            }).then(function () {
                var newButtons = new Buttons(generateDefaultButtons(newUserId));
                newButtons.save(function (err) {
                    if (err) {
                        errors.push(err);
                    }
                });
            }).then(function () {
                var newCatalog = new Catalogs(generateDefaultCatalog(newUserId));
                newCatalog.save(function (err) {
                    if (err) {
                        errors.push(err);
                    }
                });
            }).then(function () {
                var newSales = new Sales(generateDefaultSales(newUserId));
                newSales.save(function (err) {
                    if (err) {
                        errors.push(err);
                    }
                });
            }).then(function () {
                res.json({
                    success: errors.length ? false : true,
                    msg: errors.length ? errors : "Account <strong>" + email + "</strong> was sucessfully created"
                });
                if (errors.length === 0) {
                    var mailOptions = {
                        from: '"EnterpriseApps" <nvbachx9@gmail.com>',
                        to: email,
                        subject: "Online Point of Sale System Sign Up",
                        text: "Hello,\n\nyou have recently registered an account on Online Point of Sale System. Please visit the following link to complete your registration.\n\n"
                                + config.host + "/validate?key=" + newUserId.valueOf()
                                + "\n\nBest regards,\nOnline Point of Sale System Team",
                        html: ""
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });
                }
            });

        }
    });
});

module.exports = router;


// defaults
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
        currency: {
            code: "CZK",
            symbol: "Kč"
        },
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
