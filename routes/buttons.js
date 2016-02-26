var express = require('express');
var router = express.Router();
var Buttons = require('../models/Buttons');
var mongoose = require('mongoose');

router.route('/buttons')
        .post(function (req, res) {
        })
        .get(function (req, res) {
            res.json(
                    {
                        saleGroups: [
                            {
                                text: "Food 15",
                                bg: "BBAA43",
                                group: "Food",
                                tax: 15
                            },
                            {
                                text: "Food 21",
                                bg: "BB3943",
                                group: "Food",
                                tax: 15
                            },
                            {
                                text: "Vegetable",
                                bg: "52753F",
                                group: "Vegetable",
                                tax: 15
                            },
                            {
                                text: "Drinks",
                                bg: "5F9EA0",
                                group: "Drinks",
                                tax: 15
                            },
                            {
                                text: "Alcohol",
                                bg: "F49C20",
                                group: "Alcohol",
                                tax: 21
                            },
                            {
                                text: "Tobacco",
                                bg: "E9967A",
                                group: "Tobacco",
                                tax: 21
                            },
                            {
                                text: "Press",
                                bg: "607AAD",
                                group: "Press",
                                tax: 15
                            },
                            {
                                text: "Drugs",
                                bg: "E84C40",
                                group: "Drugs",
                                tax: 21
                            },
                            {
                                text: "Uncateg. 15",
                                bg: "67314B",
                                group: "Uncategorized",
                                tax: 15
                            },
                            {
                                text: "Uncateg. 21",
                                bg: "FF314B",
                                group: "Uncategorized",
                                tax: 21
                            }
                        ],
                        quickSales: [
                            {
                                text: "Brown Bread",
                                price: "19.00",
                                group: "Food",
                                tax: 15,
                                tags: ["baked", "whole"],
                                desc: "Black round bread baked in Czech"
                            },
                            {
                                text: "Roll Bread",
                                price: "3.00",
                                group: "Food",
                                tax: 15,
                                tags: ["baked", "wheat"],
                                desc: "A regular roll bread made in Czech"
                            },
                            {
                                text: "Round Bread",
                                price: "3.00",
                                group: "Food",
                                tax: 15,
                                tags: ["baked", "wheat"],
                                desc: "A common small white bread"
                            },
                            {
                                text: "Croissant",
                                price: "12.00",
                                group: "Food",
                                tax: 15,
                                tags: ["baked", "wheat", "sweet"],
                                desc: "Baked butter flavored croissant"
                            },
                            {
                                text: "Beer Bottle",
                                price: "3.00",
                                group: "Uncategorized",
                                tax: 0,
                                tags: ["refund", "bottle"],
                                desc: "3.00 CZK for a beer bottle"
                            },
                            {
                                text: "Refund Bottle",
                                price: "-3.00",
                                group: "Uncategorized",
                                tax: 0,
                                tags: ["refund", "bottle"],
                                desc: "Refund 3.00 CZK for a beer bottle"
                            }
                        ]
                    }
            );
        });

module.exports = router;
