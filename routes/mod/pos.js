var router = require('express').Router();
var Settings = require('../../models/Settings');
var utils = require('../../utils');

router.post('/pos', function (req, res) {
    var validator = {
        requestType:    /^(save|remove)$/,
        name:           /^.{3,100}$/,
        tin:            /^\d{8}$/,
        vat:            /^[A-Z]{2}\d{8,10}$/,
        street:         /^.{5,100}$/,
        city:           /^.{2,75}$/,
        zip:            /^\w{3,10}$/,
        country:        /^.{3,75}$/,
        phone:          /^\+?(\d{3})?\d{9}$/,
        currency:       /^\{"code":"(CZK)","symbol":"(Kč)"\}$/
    };
    if (!utils.isValidRequest(validator, req.body)) {
        res.json({success: false, msg: 'Invalid request. Request format is not accepted'});
    } else {
        var query = {userId: req.user._id};
        Settings.findOne(query).exec().then(function (settings) {
            //console.log(settings);
            settings.name = req.body.name;
            settings.tin = req.body.tin;
            settings.vat = req.body.vat;
            
            settings.address.street  = req.body.street ;
            settings.address.city    = req.body.city   ;
            settings.address.zip     = req.body.zip    ;
            settings.address.country = req.body.country;
            
            settings.phone = req.body.phone;
            settings.currency = JSON.parse(req.body.currency);
            return settings.save();
        }).then(function (settings) {
            var ret = {
                name: settings.name,
                tin: settings.tin,
                vat: settings.vat,
                address: settings.address,
                phone: settings.phone,
                currency: settings.currency,
                tax_rates: settings.tax_rates,
                receipt: settings.receipt,
                staff: settings.staff
            };
            res.json({success: true, msg: ret});
        }).catch(function (err) {
            res.json({success: false, msg: err});
        });
    }
});

module.exports = router;
