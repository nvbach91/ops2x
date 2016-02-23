var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Retailer = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model("settings", Retailer);
