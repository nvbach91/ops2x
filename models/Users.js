var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    email: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    activated: Boolean,
    password_pending: String,
    activation_expire: Date,
    register_date: Date,
    last_login: Date,
    nLogins: Number
});

module.exports = mongoose.model('users', Users);
