var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Retailer = new Schema({
    name: String,
    age: Number
});

module.exports = mongoose.model("retailers", Retailer);
