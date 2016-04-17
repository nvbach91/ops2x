var router = require('express').Router();
var Users = require('../models/Users');
var ObjectID = require('mongodb').ObjectID;
var utils = require('../utils');

router.get('/passwordreset', function (req, res) {
    var key = req.query.key;
    var token = req.query.token || "";
    if (!ObjectID.isValid(key) || token.length !== 64) {
        res.render('invalidrequest');
        return;
    }
    var query = {_id: new ObjectID(key), password_pending: req.query.token};
    var randomPassword = utils.generateRandomString(6);
    var options = {$set: {password_pending: "no", password: utils.hash(randomPassword)}};

    Users.findOneAndUpdate(query, options).exec().then(function (user) {
        if (!user) {
            res.render('invalidrequest');
        } else {
            res.render('passwordresetsuccess', {msg: randomPassword});
        }
    });
});

module.exports = router;
