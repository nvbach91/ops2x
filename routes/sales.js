var router = require('express').Router();
var Sales = require('../models/Sales');

router.get('/sales', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0};
    Sales.findOne(query, options, function (err, catalog) {
        if (err) {
            res.json(err);
        } else {
            res.json(catalog);
        }
    });
});

module.exports = router;
