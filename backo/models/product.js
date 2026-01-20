const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: [String], required: true },
  quantity: { type: [Number], required: true },
  image: { type: String } // ✅ store size-specific image
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
  price: { type: Number, required: true },
  brand: { type: String, required: true },
  description: { type: String },
  images: { type: String, required: true }, // main product image

  variants: [VariantSchema], // ✅ includes size-specific images

  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
