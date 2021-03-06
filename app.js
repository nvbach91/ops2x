/* global __dirname, process */
var config = require('./config');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');

var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var passport = require('passport');

var mongoose = require('mongoose');
// change the host in config.js file
mongoose.connect(config.mongodb_host);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(helmet());
//app.use(logger('dev'));
app.use(bodyParser.json({limit: '3mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '3mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use(expressSession({
 secret: process.env.SESSION_SECRET || 'suchclassifiedveryconfidentialmuchsecreetwow',
 resave: false,
 saveUninitialized: false,    
 cookie: {maxAge: 86400000} // 24 hours
 }));*/

app.use(expressSession({
    secret: 'suchclassifiedveryconfidentialmuchsecreetwow',
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60 //24hrs
    }),
    resave: false,
    saveUninitialized: false
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
var noCache = function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

var index = require('./routes/index');
var signup = require('./routes/signup');
var activate = require('./routes/activate');
var isAuthenticated = require('./routes/isAuthenticated');
var auth = require('./routes/auth');
var signout = require('./routes/signout');
var forgot = require('./routes/forgot');
var passwordreset = require('./routes/passwordreset');
app.use('/', index);
app.use('/', signup);
app.use('/', activate);
app.use('/', isAuthenticated);
app.use('/', auth);
app.use('/', signout);
app.use('/', forgot);
app.use('/', passwordreset);

var settings = require('./routes/api/settings');
var buttons = require('./routes/api/buttons');
var catalog = require('./routes/api/catalog');
var sales = require('./routes/api/sales');
var stock = require('./routes/api/stock');

app.use('/api', noCache);
app.use('/api', ensureAuthenticated);
app.use('/api', settings);
app.use('/api', buttons);
app.use('/api', catalog);
app.use('/api', sales);
app.use('/api', stock);

var changepassword = require('./routes/mod/changepassword');
var staff = require('./routes/mod/staff');
var receipt = require('./routes/mod/receipt');
var pos = require('./routes/mod/pos');
var per = require('./routes/mod/per');
var plu = require('./routes/mod/plu');
var pluimport = require('./routes/mod/pluimport');
var plulinks = require('./routes/mod/plulinks');
var updatestock = require('./routes/mod/updatestock');
var salegroups = require('./routes/mod/salegroups');
var tabs = require('./routes/mod/tabs');
var quicksales = require('./routes/mod/quicksales');
var addsale = require('./routes/mod/addsale');
var mailreceipt = require('./routes/mod/mailreceipt');
app.use('/mod', ensureAuthenticated);
app.use('/mod', changepassword);
app.use('/mod', staff);
app.use('/mod', receipt);
app.use('/mod', pos);
app.use('/mod', per);
app.use('/mod', plu);
app.use('/mod', pluimport);
app.use('/mod', plulinks);
app.use('/mod', updatestock);
app.use('/mod', salegroups);
app.use('/mod', tabs);
app.use('/mod', quicksales);
app.use('/mod', addsale);
app.use('/mod', mailreceipt);


















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
