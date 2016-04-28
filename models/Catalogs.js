var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Catalogs = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    articles: [
        {
            ean: String,
            name: String,
            price: String,
            group: String,
            tax: Number
        }
    ]
});

module.exports = mongoose.model('catalogs', Catalogs);
