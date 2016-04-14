var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Buttons = new Schema({
    userId: {type: Schema.ObjectId, index: {unique: true}},
    saleGroups: [
        {
            text: String,
            bg: String,
            group: String,
            tax: Number
        }
    ],
    tabs: [
        {
            name: String,
            quickSales: [
                {
                    bg: String,
                    text: String,
                    price: String,
                    group: String,
                    tax: Number,
                    tags: [String],
                    desc: String
                }
            ]
        }
    ]
});

module.exports = mongoose.model("buttons", Buttons);
