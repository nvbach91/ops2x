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
        /*var check = checkPluData(req.body.data, "\n", ";");
        if (!check.isValid) {
            res.json({success: false, msg: check.msg});
        } else {*/
            var query = {userId: req.user._id};

            Catalogs.findOne(query).exec().then(function (catalog) {
                catalog.articles = csvToJSON(req.body.data);
                return catalog.save();
            }).then(function (catalog) {
                res.json({success: true, msg: {articles: catalog.articles}});
            }).catch(function (err) {
                res.json({success: false, msg: err});
            });
        //}
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
/*
function checkPluData(csv, lineSeparator, valueDelimiter) {
    var lines = csv.split(lineSeparator);
    var validHeaders = ["ean", "name", "price", "group", "tax"];
    var headers = lines[0].split(valueDelimiter);
    if (headers.length !== validHeaders.length) {
        return {isValid: false, msg: "Invalid CSV header format. Incorrect number of fields. Must be " + validHeaders.length};
    }
    for (var i = 0; i < headers.length; i++) {
        headers[i] = headers[i].trim();
        if (headers[i] !== validHeaders[i]) {
            return {isValid: false, msg: "Invalid CSV header " + (i + 1) + ": " + headers[i] + ". Must be " + validHeaders[i]};
        }
    }
    var result = validHeaders.join(";");
    var validLine = [/^\d{1,13}$/, /^.{1,128}$/, /^\d{1,5}\.\d{2}$/, /^[^"]{1,50}$/, /^(0|10|15|21)$/];
    var eanSet = [];
    //var result = [];

    for (var i = 1; i < lines.length; i++) {
        var currentLine = lines[i].split(valueDelimiter);
        if (validLine.length !== currentLine.length) {
            return {isValid: false, msg: "Invalid format on line " + (i + 1) + ". Must have " + validLine.length + " values separated by semicolons (;)"};
        }
        //var obj = {};
        for (var j = 0; j < validLine.length; j++) {
            currentLine[j] = currentLine[j].trim();
            if (!validLine[j].test(currentLine[j])) {
                return {isValid: false, msg: "Invalid CSV on line " + (i + 1) + ", column: " + headers[j] + ", value: " + (currentLine[j] || "/empty/")};
            }
            if (headers[j] === "ean") {
                eanSet.push({lineNumber: i + 1, ean: currentLine[j]});
            }
            //obj[headers[j]] = currentline[j];
        }
        result += "\n" + currentLine.join(";");
        //result.push(obj);
    }
    eanSet.sort(utils.sortByEAN);
    var eanSetMaxLength = eanSet.length - 1;
    for (var i = 0; i < eanSetMaxLength; i++) {
        var currentItem = eanSet[i];
        var nextItem = eanSet[i + 1];
        if (currentItem.ean === nextItem.ean) {
            return {isValid: false, msg: "EAN codes must be unique! Duplicate EAN codes on lines " + nextItem.lineNumber + " and " + currentItem.lineNumber};
        }
    }
    return {isValid: true, msg: result};
}
;*/

module.exports = router;
