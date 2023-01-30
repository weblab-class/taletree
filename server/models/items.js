// File: models/item.js
const mongoose = require('mongoose');

const itemSchema = mongoose.Schema({
title: String,
image: String
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;