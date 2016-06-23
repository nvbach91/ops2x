var router = require('express').Router();
var Settings = require('../../models/Settings');
var utils = require('../../utils');

router.post('/receipt', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        header: /^.{0,256}$/,
        footer: /^.{0,256}$/,
        width: /^58|80$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request. Maximum length of header and footer is 256 characters, width can be 58mm or 80mm'});
    } else {
        var query = {userId: req.user._id};
        Settings.findOne(query).select('receipt').exec().then(function (settings) {
            var receipt = settings.receipt;
            receipt.header = req.body.header;
            receipt.footer = req.body.footer;
            receipt.width = parseInt(req.body.width);
            return settings.save();
        }).then(function (settings) {
            res.json({success: true, msg: settings.receipt});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
