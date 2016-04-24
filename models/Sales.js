var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Sales = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    receipts: [
        {
            number: String,
            date: Date,
            clerk: String,
            items: [
                {
                    name: String,
                    price: String,
                    quantity: Number,
                    tax_rate: Number
                }
            ],
            tendered: Number,
            confirmed: Boolean
        }
    ]
});

module.exports = mongoose.model('sales', Sales);
