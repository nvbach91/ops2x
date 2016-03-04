var router = require('express').Router();
var Settings = require('../models/Settings');

router.get('/settings', function (req, res) {
    var query = {userId: req.user._id};
    var options = {_id: 0, userId: 0};
    Settings.findOne(query, options, function (err, setting) {
        if (err) {
            res.json(err);
        } else {
            res.json(setting);
        }
    });
});

module.exports = router;
