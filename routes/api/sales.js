var router = require('express').Router();
var Sales = require('../../models/Sales');

router.post('/sales', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0, 'receipts._id': 0};
    var nReceivedReceipts = req.body.nReceivedReceipts ? req.body.nReceivedReceipts : 0;
    Sales.find(query, options).where("receipts").slice([-10 - nReceivedReceipts, 10]).exec().then(function (sales) {
        res.json(sales[0]);
    }).catch(function (err) {
        res.json(err);
    });
});

module.exports = router;
