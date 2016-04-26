var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    email: {type: String, required: true, index: {unique: true}},
    password: {type: String, required: true},
    activated: Boolean,
    password_pending: String/*,
    session_token: String*/
});

module.exports = mongoose.model('users', Users);
