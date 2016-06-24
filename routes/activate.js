var router = require('express').Router();
var Users = require('../models/Users');
var ObjectID = require('mongodb').ObjectID;

var utils = require('../utils');
var template = require('../template');

router.get('/activate', function (req, res) {
    var key = req.query.key;
    if (!ObjectID.isValid(key)) {
        res.render('invalidrequest');
        return;
    }
    var query = {_id: new ObjectID(key)};
    Users.findOneAndUpdate(query, {$set: {activated: true, activation_expire: null}}).exec().then(function (user) {
        utils.mailer.sendMail(template.generateActivatedMail(user.email), function (error, info) {
            if (error) {
                return console.log(error);
            }
        });
        res.render('activationsuccess');
    }).catch(function (err) {
        res.render('invalidrequest');
    });
});

module.exports = router;
