var router = require('express').Router();
var Stocks = require('../../models/Stocks');

router.get('/stock', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0, 'articles._id': 0};
    Stocks.findOne(query, options).exec().then(function (stock) {
        res.json(stock);
    }).catch(function (err) {
        res.json(err);
    });
});

module.exports = router;
