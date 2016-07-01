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
    ],
    links: [ // links a side PLU to a main PLU to register together, non cyclical
        {
            main: String,
            side: String
        }
    ]
});

module.exports = mongoose.model('catalogs', Catalogs);
