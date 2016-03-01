var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var users = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model("users", users);
