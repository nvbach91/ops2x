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
    phone: String,
    currency: {
        code: String,
        symbol: String
    },
    tax_rates: [Number],
    staff: [
        {
            number: {
                type: Number,
                unique: true
            },
            role: String,
            name: String,
            pin: String
        }
    ]
});

module.exports = mongoose.model("settings", Settings);
