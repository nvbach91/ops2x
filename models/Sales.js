var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Sales = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    receipts: [
        {
            number: Number,
            date: Date,
            clerk: Number,
            items: [
                {
                    ean: String,
                    price: Number,
                    tax: Number,
                    quantity: Number
                }
            ],
            confirmed: Boolean
        }
    ]
});

module.exports = mongoose.model('sales', Sales);
