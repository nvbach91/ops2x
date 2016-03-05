var router = require('express').Router();
var Catalogs = require('../models/Catalogs');

router.get('/catalog', function (req, res) {
    var query = {userId: req.user._id};
    var options = {_id: 0, userId: 0, "articles._id": 0};
    Catalogs.findOne(query, options, function (err, catalog) {
        if (err) {
            res.json(err);
        } else {
            res.json(catalog);
        }
    });
    //Catalogs.update(query, {$set:{articles:c}}, function(err, catalog){});
});

module.exports = router;
