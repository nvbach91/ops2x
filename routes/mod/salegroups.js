var router = require('express').Router();
var Buttons = require('../../models/Buttons');
var utils = require('../../utils');
var ObjectID = require('mongodb').ObjectID

router.post('/salegroups', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        tax: /^(0|10|15|21)$/,
        group: /^.{1,50}$/,
        bg: /^[A-Fa-f0-9]{6}$/,
        text: /^.{1,50}$/,
        _id: /^(\w{24}|new sg)$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request'});
    } else {
        var query = {userId: req.user._id};
        Buttons.findOne(query).select('saleGroups').exec().then(function (buttons) {
            var reqSG = req.body;
            var sgArray = buttons.saleGroups;
            if (reqSG.requestType === 'save') {
                if (reqSG._id === 'new sg') {
                    sgArray.push({
                        tax: parseInt(reqSG.tax),
                        group: reqSG.group,
                        bg: reqSG.bg,
                        text: reqSG.text
                    });
                } else {
                    var targetted = buttons.saleGroups.id(reqSG._id);
                    if (targetted) {
                        targetted.tax = reqSG.tax;
                        targetted.group = reqSG.group;
                        targetted.bg = reqSG.bg;
                        targetted.text = reqSG.text;
                    }
                }
                buttons.save().then(function () {
                    res.json({success: true, msg: targetted});
                }).catch(function (err) {
                    res.json({success: false, msg: err});
                });
            } else {

            }
        });
    }
});

module.exports = router;
