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
        _id: /^(\w{24}|new sg)$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request'});
    } else {
        var query = {userId: req.user._id};
        Buttons.findOne(query).select('saleGroups').exec().then(function (buttons) {
            var reqSG = req.body;
            if (reqSG.requestType === 'save') {
                var newSGID = new ObjectID();
                if (reqSG._id === 'new sg') {
                    buttons.saleGroups.push({
                        tax: parseInt(reqSG.tax),
                        group: reqSG.group,
                        bg: reqSG.bg,
                        _id: newSGID
                    });
                } else {
                    var targetted = buttons.saleGroups.id(reqSG._id);
                    if (targetted) {
                        targetted.tax = reqSG.tax;
                        targetted.group = reqSG.group;
                        targetted.bg = reqSG.bg;
                    }
                }
                buttons.save().then(function (b) {
                    res.json({success: true, msg: b.saleGroups.id(reqSG._id) || b.saleGroups.id(newSGID)});
                }).catch(function (err) {
                    res.json({success: false, msg: err});
                });
            } else {
                var sgs = buttons.saleGroups;
                var sgsLength = sgs.length;
                for (var i = 0; i < sgsLength; i++) {
                    if (sgs[i]._id.valueOf().toString() === reqSG._id) {
                        sgs.splice(i, 1);
                        break;
                    }
                }
                buttons.save().then(function (b) {
                    if (sgsLength === b.saleGroups.length + 1) {
                        res.json({success: true, msg: {_id: reqSG._id}});
                    } else {
                        res.json({success: false, msg: "Sale group wasn't removed"});
                    }
                }).catch(function (err) {
                    res.json({success: false, msg: err});
                });
            }
        });
    }
});

module.exports = router;
