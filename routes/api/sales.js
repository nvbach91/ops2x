var router = require('express').Router();
var Sales = require('../../models/Sales');

router.post('/sales', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0, 'receipts._id': 0};
    var nReceivedReceipts = req.body.nReceivedReceipts ? parseInt(req.body.nReceivedReceipts) : 0;
    Sales.aggregate().match(query).project({receiptSize: {$size: "$receipts"}}).exec().then(function (results) {
        var actualNumberOfReceipts = results[0].receiptSize;
        var nReceiptsLeft = actualNumberOfReceipts - nReceivedReceipts;
        if (nReceiptsLeft > 0) {
            var nReceiptsToSend = 10;            
            var offset = nReceiptsToSend + nReceivedReceipts;
            if (nReceiptsLeft < 10) {
                nReceiptsToSend = nReceiptsLeft;
            }
            /*
            console.log("received: " + nReceivedReceipts);
            console.log("left    : " + nReceiptsLeft);
            console.log("offset  :-" + negativeIndex);
            console.log("to send : " + nReceiptsToSend);
            console.log("");*/
            Sales.find(query, options).where("receipts").slice([-offset, nReceiptsToSend]).exec().then(function (sales) {
                res.json(sales[0]);
            }).catch(function (err) {
                res.json(err);
            });
        } else {
            res.json({receipts: []});
        }
    }).catch(function (err) {

    });
});

module.exports = router;
