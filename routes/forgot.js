var config = require('../config');
var router = require('express').Router();
var Users = require('../models/Users');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(config.mail_transport);
var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function isValidUsername(username) {
    return emailRegex.test(username);
}
;
router.post('/forgot', function (req, res) {
    var newEmail = req.body.email;
    var token = crypto.randomBytes(32).toString('hex');
    Users.findOneAndUpdate({email: newEmail}, {$set: {password_pending: token}}).exec().then(function (user) {
        if (!user) {
            res.json({success: false, msg: 'Account ' + newEmail + ' does not exist'});
        } else {
            transporter.sendMail(config.generateForgotMail(newEmail, user._id.valueOf(), token), function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Forgot Message sent to ' + newEmail + ': ' + info.response);
                res.json({success: true, msg: newEmail});
            });
        }
    }).catch(function (err) {
        res.json({success: false, msg: err});
    });
});

module.exports = router;
