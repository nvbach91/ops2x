var router = require('express').Router();
var Stocks = require('../../models/Stocks');
var utils = require('../../utils');

router.post('/updatestock', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        ean: /^\d{1,13}$/,
        balance: /^\-?\d{1,5}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid format'});
    } else {
        var query = {userId: req.user._id};

        Stocks.findOne(query).exec().then(function (stock) {
            var articles = stock.articles;
            var articleIndex = utils.binaryIndexOf(articles, 'ean', req.body.ean);
            if (articleIndex >= 0) {  // found article, save its balance
                if (req.body.requestType === 'save') {
                    var article = articles[articleIndex];
                    article.balance = parseInt(req.body.balance);
                } else if (req.body.requestType === 'remove') { // remove from stock = reset balance to 0
                    articles.splice(articleIndex, 1);
                }
            } else {
                if (req.body.requestType === 'save') { // add new stock record
                    utils.binaryInsert({ean: req.body.ean, balance: parseInt(req.body.balance)}, articles, 'ean');
                } else if (req.body.requestType === 'remove') { // do nothing if user wants to remove article from stock records
                    throw "PLU not found in stock record for removal";
                }
            }
            return stock.save();
        }).then(function (stock) {
            res.json({success: true, msg: {ean: req.body.ean, balance: parseInt(req.body.balance)}});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
