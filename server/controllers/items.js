
const Item = require("../models/items");
exports.getItems = async (req, res) => {
console.log("get items");
try {
const item = await Item.find();
res.status(200).json(item);
} catch (error) {
res.status(404).json({ message: error.message });
}
};

exports.createItem = async (req, res) => {
const item = new Item(req.body);
try {
    await item.save();
    res.status(201).json(item);
    } catch (error) {
    }
};