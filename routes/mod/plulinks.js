var router = require('express').Router();
var Catalogs = require('../../models/Catalogs');
var utils = require('../../utils');

router.post('/plulinks', function (req, res) {
    var validator = {
        requestType: /^(save|remove)$/,
        main: /^\d{1,13}$/,
        side: /^\d{1,13}$/ /*function (sideEANs) {
            var sides = null;
            try {
                sides = JSON.parse(sideEANs);
            } catch (e) {
                return false;
            }
            if (!sides || !sides.length) {
                return false;
            }
            for (var i = 0; i < sides.length; i++) {
                if(!/^\d{1,13}$/.test(sides[i])) {
                    return false;
                }
            }
            return true;
        }*/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid format'});
    } else if (req.body.main === req.body.side) {        
        res.json({success: false, msg: 'Side PLU EAN cannot be the same as Main PLU EAN'});
    } else {
        var query = {userId: req.user._id};
        var options = {userId: 0, articles: 0}; // don't exclude _id or __v or else it can't be .saved()
        Catalogs.findOne(query, options).exec().then(function (catalog) {
            var links = catalog.links; // this is now always sorted by main EAN even after insert
            var mainLinkIndex = utils.binaryIndexOf(links, 'main', req.body.main);

            if (mainLinkIndex >= 0) {  // found plu link
                if (req.body.requestType === 'save') {
                    var link = links[mainLinkIndex];
                    link.side = req.body.side;
                } else if (req.body.requestType === 'remove') {
                    links.splice(mainLinkIndex, 1);
                }
            } else { // article not found
                if (req.body.requestType === 'save') {
                    utils.binaryInsert({main: req.body.main, side: req.body.side}, links, 'main');
                } else if (req.body.requestType === 'remove') {
                    throw "Cannot remove non existing PLU link";
                }
            }
            return catalog.save();
        }).then(function (catalog) {
            res.json({success: true, msg: catalog.links});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
