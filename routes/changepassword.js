var router = require('express').Router();
var crypto = require('crypto');
var Users = require('../models/Users');

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
};

router.post('/changepassword', function (req, res) {
    var query = {_id: req.user._id, password: hash(req.body.oldpassword)};
    var update = {$set: {password: hash(req.body.newpassword)}};
    Users.findOneAndUpdate(query, update, function (err, user) {
        if (err) {
            res.json(err);
        } else {
            if (!user) {
                res.json({passwordChanged: false});
            } else {
                res.json({passwordChanged: true});
            }
        }
    });
});

module.exports = router;
