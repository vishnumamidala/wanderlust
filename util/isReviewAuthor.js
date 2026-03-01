const Review = require("../models/review");

module.exports = async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review || !review.author.equals(req.user._id)) {
    req.flash("error", "Permission denied");
    return res.redirect("back");
  }
  next();
};
