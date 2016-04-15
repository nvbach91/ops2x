var router = require('express').Router();
var Users = require('../models/Users');
var ObjectID = require('mongodb').ObjectID

router.get('/validate', function (req, res) {
    var key = req.query.key;
    if (!ObjectID.isValid(key)) {
        res.redirect("/");
        return;
    }
    var query = {_id: new ObjectID(key)};
    Users.findOneAndUpdate(query, {validated: true}, function (err, user) {
        if (user) {
            res.redirect("/");
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;
