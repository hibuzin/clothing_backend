const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
    price: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    brand: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },

    reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
