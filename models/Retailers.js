var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Retailers = new Schema({
    email: String,
    password: String
});

module.exports = mongoose.model("retailers", Retailers);
