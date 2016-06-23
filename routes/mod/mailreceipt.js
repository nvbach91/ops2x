var router = require('express').Router();
var utils = require('../../utils');
var config = require('../../config');
var template = require('../../template');

router.post('/mailreceipt', function (req, res) {
    var newReceipt = req.body;
    var newReceiptObj = {
        shop: newReceipt.shop,
        number: newReceipt.number,
        date: new Date(newReceipt.date),
        clerk: newReceipt.clerk,
        items: JSON.parse(newReceipt.items),
        tendered: parseFloat(newReceipt.tendered)
    };
    utils.mailer.sendMail(template.generateReceiptMail(newReceipt.recipient, newReceiptObj), function (error, info) {
        if (error) {
            res.json({success: false, msg: error});
            console.log(error);
        } else {
            res.json({success: true, msg: info.response});
        }
    });
});


module.exports = router;
