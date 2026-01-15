const mongoose = require('mongoose');

/**
 * CART ITEM (Single product variant)
 */
const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    color: {
      type: String,
      required: true,
      trim: true
    },

    size: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false } // prevents unnecessary sub-IDs
);

/**
 * CART (One cart per user)
 */
const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    items: {
      type: [CartItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
