const express = require('express');
const Review = require('../models/review');
const Product = require('../models/product');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * ADD or UPDATE REVIEW
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

    // one review per user per product
    let review = await Review.findOne({ product: productId, user: userId });

    if (review) {
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        product: productId,
        user: userId,
        rating,
        comment
      });
    }

    res.json({ message: 'Review saved', review });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


/**
 * GET ALL REVIEWS
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
router.delete('/:productId', auth, async (req, res) => {
  try {
    await Review.findOneAndDelete({
      product: req.params.productId,
      user: req.user.id
    });

    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
