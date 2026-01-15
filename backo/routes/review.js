const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * ADD REVIEW (only if purchased, one review per user per product)
 * POST /api/reviews/:productId
 */
router.post('/:productId', auth, upload.any(), async (req, res) => {
  console.log(req.files);
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // prevent duplicate review
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You already reviewed this product' });
    }

    // purchase check (only delivered orders)
    const order = await Order.findOne({
      user: userId,
      status: 'DELIVERED',
      'items.product': new mongoose.Types.ObjectId(productId),
    });

    if (!order) {
      return res.status(403).json({
        error: 'You must purchase this product to review',
      });
    }

    // ✅ collect image URLs (optional)
    const images = req.files ? req.files.map(file => file.path) : [];

    // create review
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment,
      images, // ✅ SAVED HERE
    });

    // link review to product
    await Product.findByIdAndUpdate(productId, {
      $addToSet: { reviews: review._id },
    });

    res.status(201).json({
      message: 'Review added',
      review,
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
);

router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.json({
      message: 'Review updated',
      review
    });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET ALL REVIEWS (admin/debug)
 * GET /api/reviews
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name price')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('Get all reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET REVIEWS BY PRODUCT
 * GET /api/reviews/product/:productId
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error('Get product reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE REVIEW (only owner)
 * DELETE /api/reviews/delete/:reviewId
 */
router.delete('/delete/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // remove review reference from product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id }
    });

    await review.deleteOne();

    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
