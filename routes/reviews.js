const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Review = require("../models/review");
const isLoggedIn = require("../util/isLoggedIn");
const isReviewAuthor = require("../util/isReviewAuthor");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");

// CREATE - Add a review
router.post("/", isLoggedIn, wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect(`/listings/${req.params.id}`);
  }
  
  const review = new Review({
    rating: req.body.review.rating,
    comment: req.body.review.comment,
    author: req.user._id,
    listing: listing._id
  });
  
  listing.reviews.push(review);
  await review.save();
  await listing.save();
  
  req.flash("success", "Review added!");
  res.redirect(`/listings/${listing._id}`);
}));

// UPDATE - Edit a review
router.put("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res, next) => {
  const { rating, comment } = req.body.review;
  
  const review = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { rating, comment },
    { new: true, runValidators: true }
  ).populate("author");
  
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${req.params.id}`);
  }
  
  req.flash("success", "Review updated!");
  res.redirect(`/listings/${req.params.id}`);
}));

// DELETE - Remove a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,
  wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId }
    });
    
    await Review.findByIdAndDelete(reviewId);
    
    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
