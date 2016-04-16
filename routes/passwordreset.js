
var router = require('express').Router();
var Users = require('../models/Users');
var crypto = require('crypto');
var ObjectID = require('mongodb').ObjectID

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
;
router.get('/passwordreset', function (req, res) {
    var key = req.query.key;
    if (!ObjectID.isValid(key)) {
        res.render('invalidrequest');
        return;
    }    
    var query = {_id: new ObjectID(key), password_pending: req.query.token};
    var randomPassword = crypto.randomBytes(6).toString('hex');
    var options = {$set: {password_pending: "no", password: hash(randomPassword)}};
    
    Users.findOneAndUpdate(query, options).exec().then(function (user) {
        if (!user) {
            res.render('invalidrequest');
        } else {
            res.render('passwordresetsuccess', {msg: randomPassword});
        }
    });
});

module.exports = router;
