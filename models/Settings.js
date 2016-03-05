var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Settings = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    tin: {type: String, unique: true},
    vat: {type: String, unique: true},
    name: String,
    address: {
        street: String,
        city: String,
        zip: String,
        country: String
    },
    phones: [String],
    currency: {
        code: String,
        symbol: String
    },
    decimal_delimiter: String,
    timezone: String,
    tax_rates: [Number],
    buttons: {
        saleGroups: [
            {
                text: String,
                bg: String,
                group: String,
                tax: Number
            }
        ],
        quickSales: [
            {
                text: String,
                price: String,
                group: String,
                tax: Number,
                tags: [String],
                desc: String
            }
        ]
    }
});

module.exports = mongoose.model("settings", Settings);
