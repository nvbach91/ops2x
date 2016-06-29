var router = require('express').Router();
var Settings = require('../../models/Settings');
var utils = require('../../utils');

router.post('/per', function (req, res) {
    var validator = {
        requestType:    /^(save|remove)$/,
        name:           /^.{3,100}$/,
        customerDisplay:/^true|false$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request. Request format is not accepted'});
    } else {
        var query = {userId: req.user._id};
        Settings.findOne(query).exec().then(function (settings) {
            //console.log(settings);
            settings.customer_display.name = req.body.name;
            settings.customer_display.active = req.body.customerDisplay === 'true';
            return settings.save();
        }).then(function (settings) {            
            res.json({success: true, msg: {name: req.body.name, active: req.body.customerDisplay === 'true'}});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
