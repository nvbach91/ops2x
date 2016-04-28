var router = require('express').Router();
var Buttons = require('../../models/Buttons');
var utils = require('../../utils');

router.post('/quicksales', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        tab: /^[1-5]$/,
        ean: /^\d{1,13}$/,
        bg: /^[A-Fa-f0-9]{6}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request'});
    } else {
        var query = {userId: req.user._id};
        Buttons.findOne(query).select('tabs').exec().then(function (buttons) {
            var r = req.body;
            var tabIndex = parseInt(r.tab) - 1;
            if (r.requestType === 'save') {
                var tabs = buttons.tabs;
                var quickSales = tabs[tabIndex].quickSales;
                var isFoundInTab = false;
                var foundIndex = -1;
                for (var i = 0; i < quickSales.length; i++) {
                    var qs = quickSales[i];
                    if (qs.ean === r.ean) {
                        isFoundInTab = true;
                        foundIndex = i;
                        break;
                    }
                }
                if (isFoundInTab) {
                    var thisQs = quickSales[foundIndex];
                    thisQs.ean = r.ean;
                    thisQs.bg = r.bg;

                } else {
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        var thisQuickSales = tab.quickSales;
                        for (var j = 0; j < thisQuickSales.length; j++) {
                            if (thisQuickSales[i].ean === r.ean) {
                                thisQuickSales.splice(i, 1);
                            }
                        }
                    }
                    quickSales.push({
                        ean: r.ean,
                        bg: r.bg
                    });
                }
            } else {

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
