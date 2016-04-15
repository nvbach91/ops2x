var router = require('express').Router();
var passport = require('passport');
var passportLocal = require('passport-local');
var crypto = require('crypto');
var Users = require('../models/Users');

function isValidUsername(username) {
    if (["guest"].indexOf(username) >= 0) {
        return true;
    }
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(username);
};

function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
};

passport.use(new passportLocal.Strategy(function (username, password, done) {
    if (!isValidUsername(username)) {
        done(null, null);
    } else {
        Users.findOne({email: username}, function (err, user) {
            if (user) {
                if (username === user.email && hash(password) === user.password && user.validated) {
                    done(null, {id: user._id, username: username});
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
