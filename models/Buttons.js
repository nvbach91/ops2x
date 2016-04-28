var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Buttons = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    saleGroups: [
        {
            tax: Number,
            group: String,
            bg: String
        }
    ],
    tabs: [
        {
            name: String,
            quickSales: [
                {
                    ean: String,
                    bg: String
                }
            ]
        }
    ]
});

module.exports = mongoose.model('buttons', Buttons);
