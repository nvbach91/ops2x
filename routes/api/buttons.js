var router = require('express').Router();
var Buttons = require('../../models/Buttons');

router.get('/buttons', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0};
    Buttons.findOne(query, options, function (err, setting) {
        if (err) {
            res.json(err);
        } else {
            res.json(setting);
        }
    });
});

module.exports = router;
