var express = require('express');
var router = express.Router();
var Retailers = require('../models/Retailers');
var mongoose = require('mongoose');

router.route('/retailer')
        .post(function (req, res) {
        })
        .get(function (req, res) {
            Retailers.find(function (err, retailers) {
                if (err) {
                    res.send(err);
                }
                res.json(retailers);
            });
        });

module.exports = router;
