var router = require('express').Router();
var Sales = require('../../models/Sales');
var Stocks = require('../../models/Stocks');
var utils = require('../../utils');

router.post('/addsale', function (req, res) {
    var query = {userId: req.user._id};
    var newReceipt = req.body;
    var validator = {
        number: /^\d+$/,
        date: /^.+$/,
        clerk: /^.{3,50}$/,
        items: /^\[{.+}\]$/,
        confirmed: /^false$/,
        tendered: /^\d+(\.\d{2})?$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid format'});
    } else {
        var newReceiptObj = {
            number: parseInt(newReceipt.number),
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
            return Stocks.findOne(query).exec();
        }).then(function (stocks) {
            var articles = stocks.articles;
            var items = newReceiptObj.items;
            // for each item in the basket deduct the quantity from the balance of the article
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.ean !== "") {
                    var index = utils.binaryIndexOf(articles, 'ean', item.ean);
                    if (index >= 0) {
                        var article = articles[index];
                        article.balance -= item.quantity;
                    } else {
                        // insert a new record with the initial balance of minus quantity 
                        // and insert so array and remains sorted
                        utils.binaryInsert({ean: item.ean, balance: -item.quantity}, articles, 'ean');
                    }
                }
            }
            return stocks.save();
        }).then(function () {
            res.json({success: true, msg: newReceiptObj});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});


module.exports = router;
