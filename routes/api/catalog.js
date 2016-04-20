var router = require('express').Router();
var Catalogs = require('../../models/Catalogs');

router.get('/catalog', function (req, res) {
    var query = {userId: req.user._id};
    var options = {__v: 0, _id: 0, userId: 0};
    Catalogs.findOne(query, options).exec().then(function (catalog) {
        console.log(catalog);
        res.json(catalog);
    }).catch(function (err) {
        res.json(err);
    });
});

module.exports = router;
