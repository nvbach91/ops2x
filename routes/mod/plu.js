var router = require('express').Router();
var Catalogs = require('../../models/Catalogs');
var utils = require('../../utils');

router.post('/plu', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        ean: /^\d{1,13}$/,
        name: /^[^"]{1,128}$/,
        price: /^\d{1,5}\.\d{2}$/,
        group: /^[^"]{0,128}$/,
        tax: /^(0|10|15|21)$/
    };
    if (req.body.name === 'New PLU') {        
        res.json({success: false, msg: 'Cannot save as "New PLU"'});
    } else if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid format'});
    } else {
        var query = {userId: req.user._id};
        var searchArticle = {
            ean: req.body.ean,
            name: req.body.name,
            price: req.body.price,
            group: req.body.group,
            tax: req.body.tax
        };
        Catalogs.findOne(query).exec().then(function (catalog) {
            var articles = catalog.articles;
            articles.sort(utils.sortByEAN);
            var articleIndex = utils.binaryIndexOf(articles, 'ean', searchArticle.ean);
          
            if (articleIndex >= 0) {  // found article
                if (req.body.requestType === 'save') {
                    var article = articles[articleIndex];
                    article.name = searchArticle.name;
                    article.price = searchArticle.price;
                    article.group = searchArticle.group;
                    article.tax = searchArticle.tax;
                } else if (req.body.requestType === 'remove') {
                    articles.splice(articleIndex, 1);
                }  
            } else { // article not found
                if (req.body.requestType === 'save') {
                    articles.push(searchArticle);
                    articles.sort(utils.sortByEAN);
                } else if (req.body.requestType === 'remove') {
                    throw "Cannot remove non existing PLU";
                }
            }            
            return catalog.save();
        }).then(function (catalog) {
            res.json({success: true, msg: searchArticle});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
