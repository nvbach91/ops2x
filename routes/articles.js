var express = require('express');
var router = express.Router();
var Retailer = require('../models/Retailer');
var mongoose = require('mongoose');

router.route('/articles')
        .post(function (req, res) {
        })
        .get(function (req, res) {
            Retailer.find(function (err, retailers) {
                if (err) {
                    res.send(err);
                }
                res.json(retailers);
            });
        });

module.exports = router;
