var config = require('../config');
var template = require('../template');
var router = require('express').Router();
var Users = require('../models/Users');
var utils = require('../utils');

router.post('/forgot', function (req, res) {
    var newEmail = req.body.email;
    var token = utils.generateRandomString(32);
    Users.findOneAndUpdate({email: newEmail}, {$set: {password_pending: token}}).exec().then(function (user) {
        if (!user) {
            res.json({success: false, msg: 'Account ' + newEmail + ' does not exist'});
        } else {
            utils.mailer.sendMail(template.generateForgotMail(newEmail, user._id.valueOf(), token), function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({success: false, msg: error});
                } else {
                    console.log('Forgot Message sent to ' + newEmail + ': ' + info.response);
                    res.json({success: true, msg: newEmail});
                }
            });
        }
    }).catch(function (err) {
        res.json({success: false, msg: err});
    });
});

module.exports = router;
