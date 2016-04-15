/* global __dirname, process */
var config = require('./config');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');

var expressSession = require('express-session');
var passport = require('passport');

var mongoose = require('mongoose');
// use one of the following mongodb connections, either a local instance or a remote instance
mongoose.connect(config.mongodb_host);
//mongoose.connect('mongodb://81.2.236.231:37017/test', {user: 'guest', pass: 'tseug'});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
app.use(favicon(path.join(__dirname, 'public/img', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'suchclassifiedveryconfidentialmuchsecreetwow',
    resave: false,
    saveUninitialized: false,    
    cookie: {maxAge: 86400000} // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.sendStatus(401);
    }
};

var index = require('./routes/index');
var signup = require('./routes/signup');
var activate = require('./routes/activate');
var isAuthenticated = require('./routes/isAuthenticated');
var auth = require('./routes/auth');
var logout = require('./routes/logout');
var settings = require('./routes/settings');
var buttons = require('./routes/buttons');
var catalog = require('./routes/catalog');
var sales = require('./routes/sales');

var changepassword = require('./routes/changepassword');

app.use('/', index);
app.use('/', signup);
app.use('/', activate);
app.use('/', isAuthenticated);
app.use('/', auth);
app.use('/', logout);
app.use('/api', ensureAuthenticated);
app.use('/api', settings);
app.use('/api', buttons);
app.use('/api', catalog);
app.use('/api', sales);

app.use('/', changepassword);

















// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.sendStatus(404);
    /*var err = new Error('Not Found');
     err.status = 404;
     next(err);*/
});

// error handlers

// development error handler
// will print stacktrace
/*if (app.get('env') === 'development') {
 app.use(function (err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: err
 });
 });
 }
 */
// production error handler
// no stacktraces leaked to user
/*
 app.use(function (err, req, res, next) {
 res.status(err.status || 500);
 res.render('error', {
 message: err.message,
 error: {}
 });
 });*/


module.exports = app;
