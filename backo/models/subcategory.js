const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
