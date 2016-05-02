var router = require('express').Router();
var Buttons = require('../../models/Buttons');
var utils = require('../../utils');

router.post('/quicksales', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        currentTab: /^[0-5]$/,
        destinationTab: /^[1-5]$/,
        currentEan: /^\-|\d{1,13}$/,
        newEan: /^\d{1,13}$/,
        bg: /^[A-Fa-f0-9]{6}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request'});
    } else {
        var query = {userId: req.user._id};
        Buttons.findOne(query).select('tabs').exec().then(function (buttons) {
            var r = req.body;
            var tabs = buttons.tabs;
            var destinationQuickSales = tabs[parseInt(r.destinationTab) - 1].quickSales;
            if (r.requestType === 'save') {
                if (r.currentTab === '0') { // save new quick sale button
                    destinationQuickSales.push({
                        ean: r.newEan,
                        bg: r.bg
                    });
                } else if (r.destinationTab === r.currentTab) { // save existing button in the current tab
                    for (var i = 0; i < destinationQuickSales.length; i++) {
                        var qs = destinationQuickSales[i];
                        if (qs.ean === r.currentEan) {
                            qs.ean = r.newEan;
                            qs.bg = r.bg;
                            break;
                        }
                    }
                } else { // move existing button to another tab
                    var currentQuickSales = tabs[parseInt(r.currentTab) - 1].quickSales;
                    for (var i = 0; i < currentQuickSales.length; i++) {
                        var qs = currentQuickSales[i];
                        if (qs.ean === r.currentEan) {
                            qs.ean = r.newEan;
                            qs.bg = r.bg;
                            destinationQuickSales.push(qs);
                            currentQuickSales.splice(i, 1);
                            break;
                        }
                    }
                }
            } else { // remove the button from the destination tab
                for (var i = 0; i < destinationQuickSales.length; i++) {
                    var qs = destinationQuickSales[i];
                    if (qs.ean === r.currentEan) {
                        destinationQuickSales.splice(i, 1);
                        break;
                    }
                }
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
