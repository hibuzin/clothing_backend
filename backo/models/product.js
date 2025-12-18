const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    description: { type: String },
    image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
