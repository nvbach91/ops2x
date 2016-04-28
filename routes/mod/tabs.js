var router = require('express').Router();
var Buttons = require('../../models/Buttons');
var utils = require('../../utils');

router.post('/tabs', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        number: /^[1-5]$/,
        name: /^.{1,20}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request'});
    } else {
        var query = {userId: req.user._id};
        Buttons.findOne(query).select('tabs').exec().then(function (buttons) {
            var r = req.body;
            var tabIndex = parseInt(r.number) - 1;
            if (r.requestType === 'save') {
                if (tabIndex >= buttons.tabs.length) {
                    buttons.tabs.push({
                        name: r.name,
                        quickSales: []
                    });
                } else {
                    buttons.tabs[tabIndex].name = r.name;
                }
            } else {
                buttons.tabs.splice(tabIndex, 1);
            }

            buttons.save().then(function (b) {
                res.json({success: true, msg: b.tabs});
            }).catch(function (err) {
                res.json({success: false, msg: err});
            });
        });
    }
});

module.exports = router;
