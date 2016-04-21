var router = require('express').Router();
var Catalogs = require('../../models/Catalogs');
var utils = require('../../utils');

router.post('/pluimport', function (req, res) {
    var validator = {
        data: /.*/,
        requestType: /^import$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid format'});
    } else {

        var query = {userId: req.user._id};

        Catalogs.findOne(query).exec().then(function (catalog) {
            catalog.articles = csvToJSON(req.body.data);
            return catalog.save();
        }).then(function (catalog) {
            res.json({success: true, msg: {articles: catalog.articles}});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });

    }
});

function csvToJSON(csv) {
    var lines = csv.split("\n");
    var result = [];
    var headers = lines[0].split(";");
    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentLine = lines[i].split(";");
        for (var j = 0; j < headers.length; j++) {
            var newValue = currentLine[j];
            if (headers[j] === "tax") {
                newValue = parseInt(newValue);
            }
            obj[headers[j]] = newValue;
        }
        result.push(obj);
    }
    return result;
}

module.exports = router;
