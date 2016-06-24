var router = require('express').Router();
var passport = require('passport');
var passportLocal = require('passport-local');
var Users = require('../models/Users');
var utils = require('../utils');

passport.use(new passportLocal.Strategy(function (username, password, done) {
    if (!(username)) {
        done(null, null);
    } else {
        Users.findOne({email: username}, function (err, user) {
            if (user) {
                if (username === user.email && utils.hash(password) === user.password && user.activated) {
                    user.last_login = new Date();
                    if (user.nLogins === undefined) {
                        user.nLogins = 0;
                    }
                    user.nLogins++;
                    if (user.register_date === undefined) {
                        user.register_date = new Date();
                    }
                    user.save().then(function (u) {
                        done(null, {id: user._id, username: username});
                    }).catch(function(err){
                        console.log(err);
                    });
                } else {
                    done(null, null);
                }
            } else {
                done(null, null);
            }
        });
    }
}));

passport.serializeUser(function (user, done) {
    done(null, {id: user.id, username: user.username});
});

passport.deserializeUser(function (user, done) {
    //done(null, {id: user.id, username: user.username});
    Users.findById(user.id, function (err, user) {
        done(err, user);
    });
});

router.post('/auth', passport.authenticate('local'), function (req, res) {
    res.json({isAuthenticated: req.isAuthenticated()});
});

module.exports = router;
