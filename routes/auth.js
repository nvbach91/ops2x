var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users');
var passport = require('passport');

router.route('/auth')
        .post(/*passport.authenticate('local'), */function (req, res) {
            res.json({isAuthenticated: true});
        })
        .get(function (req, res) {
            res.json({isAuthenticated: req.isAuthenticated()});
            /*Users.findOne({email: req},function (err, user) {
                if (err) {
                    res.send(err);
                }
                if(user)
                res.json(user);
            });*/
            //console.log(req);
            //res.send(1);
        });

module.exports = router;
