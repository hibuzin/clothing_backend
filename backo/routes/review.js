const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');
const auth = require('../middleware/auth');



const router = express.Router();

/**
 * ADD REVIEW (only if purchased)
 * POST /api/reviews/:productId
 */
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

    // check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 🔍 PURCHASE CHECK
    const order = await Order.findOne({
      user: userId,
      status: 'DELIVERED',
      'items.product': new mongoose.Types.ObjectId(productId)
    });

    // 🧪 DEBUG LOGS (temporary)
    console.log('Product ID:', productId);
    console.log('Order found:', order);

    if (!order) {
      return res.status(403).json({
        error: 'You must purchase this product to review'
      });
    }

    // CREATE REVIEW
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      comment
    });

    res.status(201).json({
      message: 'Review added',
      review
    });

  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * UPDATE REVIEW
 * PUT /api/reviews/:reviewId
 */
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // only owner can update
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // update fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.json({
      message: 'Review updated',
      review
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



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
 * GET PRODUCT REVIEWS
 * GET /api/reviews/:productId
 */
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE MY REVIEW
 * DELETE /api/reviews/:productId
 */
/**
 * DELETE REVIEW
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

    await review.deleteOne();

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;

