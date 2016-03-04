var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model("users", Users);
