// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Provider = require('../models/Provider');

// @route   POST /api/reviews
// @desc    Create a new review for a provider
router.post('/', auth, async (req, res) => {
  const { providerId, rating, comment } = req.body;
  const customerId = req.user.id;

  try {
    // Create and save the new review
    const newReview = new Review({
      provider: providerId,
      customer: customerId,
      rating,
      comment,
    });
    await newReview.save();

    // After saving the review, recalculate the provider's average rating
    const reviews = await Review.find({ provider: providerId });
    const reviewCount = reviews.length;
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviewCount;

    // Update the provider document
    await Provider.findByIdAndUpdate(providerId, {
      reviewCount: reviewCount,
      averageRating: averageRating.toFixed(1), // Round to one decimal place
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/reviews/:providerId
// @desc    Get all reviews for a specific provider
router.get('/:providerId', async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
                                    .populate('customer', 'name') // Get the customer's name
                                    .sort({ createdAt: -1 }); // Show newest reviews first
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;