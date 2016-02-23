var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var buttons = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model("buttons", buttons);
