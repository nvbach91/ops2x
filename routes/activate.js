var router = require('express').Router();
var Users = require('../models/Users');
var ObjectID = require('mongodb').ObjectID

router.get('/activate', function (req, res) {
    var key = req.query.key;
    if (!ObjectID.isValid(key)) {
        res.render('invalidrequest');
        return;
    }
    var query = {_id: new ObjectID(key)};
    Users.findOneAndUpdate(query, {$set:{activated: true}}, function (err, user) {
        if (user) {
            res.render('activationsuccess');
        } else {
            res.render('invalidrequest');
        }
    });
});

module.exports = router;
