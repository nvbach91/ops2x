var router = require('express').Router();
var Sales = require('../../models/Sales');
var utils = require('../../utils');

router.post('/addsale', function (req, res) {
    var query = {userId: req.user._id};
    var newReceipt = req.body;
    var newReceiptObj = {
        number: newReceipt.number,
        date: new Date(newReceipt.date),
        clerk: newReceipt.clerk,
        items: JSON.parse(newReceipt.items),
        tendered: parseFloat(newReceipt.tendered),
        confirmed: true
    };
    Sales.findOne(query).exec().then(function (sales) {

        sales.receipts.push(newReceiptObj);
        return sales.save();
    }).then(function (sales) {
        res.json({success: true, msg: newReceiptObj});
    }).catch(function (err) {
        res.json({success: false, msg: err});
    });
});


module.exports = router;
