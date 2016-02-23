var express = require('express');
var router = express.Router();
var Settings = require('../models/Settings');
var mongoose = require('mongoose');

router.route('/settings')
        .post(function (req, res) {
        })
        .get(function (req, res) {
            Settings.find(function (err, retailers) {
                if (err) {
                    res.send(err);
                }
                res.json(retailers);
            });
        });

module.exports = router;
