const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Create a new review for a provider
router.post('/', auth, async (req, res) => {
  const { providerId, bookingId, rating, comment } = req.body;
  const customerId = req.user.id;

  try {
    // Check if a review has already been left for this booking
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found.' });
      }
      if (booking.reviewLeft) {
        return res.status(400).json({ message: 'A review has already been submitted for this booking.' });
      }
      // Mark the booking as having a review
      booking.reviewLeft = true;
      await booking.save();
    }

    // Create and save the new review
    const newReview = new Review({
      provider: providerId,
      customer: customerId,
      rating,
      comment,
    });
    await newReview.save();

    // Recalculate the provider's average rating
    const reviews = await Review.find({ provider: providerId });
    const reviewCount = reviews.length;
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviewCount;

    // Update the provider document
    await Provider.findByIdAndUpdate(providerId, {
      reviewCount: reviewCount,
      averageRating: averageRating.toFixed(1),
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
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;