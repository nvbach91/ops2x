var router = require('express').Router();
var Catalogs = require('../../models/Catalogs');
var utils = require('../../utils')

router.get('/catalog', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0, 'articles._id': 0, 'links._id': 0};
    Catalogs.findOne(query, options).exec().then(function (catalog) {
        res.json({
            csv: utils.convertJsonCatalogToCSV(catalog.articles),
            links: catalog.links
        });
    }).catch(function (err) {
        res.json(err);
    });
});

module.exports = router;
