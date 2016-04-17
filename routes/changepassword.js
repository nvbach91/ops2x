var router = require('express').Router();
var Users = require('../models/Users');
var utils = require('../utils');

router.post('/changepassword', function (req, res) {
    if (req.body.newpassword.length < 8 || req.body.newpassword.length > 128) {
        res.json({passwordChanged: false, msg: 'New password too short'});
    } else {
        var query = {_id: req.user._id, password: utils.hash(req.body.oldpassword)};
        var update = {$set: {password: utils.hash(req.body.newpassword)}};
        Users.findOneAndUpdate(query, update, function (err, user) {
            if (err) {
                res.json({passwordChanged: false, msg: err});
            } else {
                if (!user) {
                    res.json({passwordChanged: false, msg: 'Wrong password'});
                } else {
                    res.json({passwordChanged: true});
                }
            }
        });
    }
});

module.exports = router;
