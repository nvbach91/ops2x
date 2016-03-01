var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var expressSession = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect('mongodb://127.0.0.1/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public/img', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var Users = mongoose.model('users',new Schema({
    email: String,
    password: String
}));

passport.use(new passportLocal.Strategy(function (username, password, done) {
    Users.findOne({email: username}, function (err, user) {
        if (username === user.email && password === user.password) {
            done(null, {id: username, name: username});
        } else {
            done(null, null);
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    done(null, {id: id, name: id});
});

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.sendStatus(403);
    }
}
;
var index = require('./routes/index');
//var retailer = require('./routes/retailer');
//var settings = require('./routes/settings');
//var articles = require('./routes/articles');
//var auth = require('./routes/auth');
var buttons = require('./routes/buttons');

app.use('/', index);
//app.use('/api', retailer);
//app.use('/api', settings);
//app.use('/api', articles);
//app.use('/api', auth);
app.use('/api', ensureAuthenticated);
app.use('/api', buttons);


app.post('/auth', passport.authenticate('local'), function (req, res) {
    res.json({isAuthenticated: req.isAuthenticated()});
});




















// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
