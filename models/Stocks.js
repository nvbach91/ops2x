var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stocks = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    articles: [
        {
            ean: String,
            balance: Number
        }
    ]
});

module.exports = mongoose.model('stocks', Stocks);
