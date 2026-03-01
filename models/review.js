const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

// Index for efficient queries
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ author: 1 });

// Static method to calculate average rating for a listing
reviewSchema.statics.calcAverageRating = async function(listingId) {
  const stats = await this.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: '$listing',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  try {
    await mongoose.model('Listing').findByIdAndUpdate(listingId, {
      avgRatingValue: stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0,
      reviewCount: stats[0] ? stats[0].nRating : 0
    });
  } catch (err) {
    console.error('Error calculating average rating:', err);
  }
};

// Call calcAverageRating after saving a review
reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.listing);
});

// Call calcAverageRating before removing a review
reviewSchema.pre('remove', function(next) {
  this.constructor.calcAverageRating(this.listing);
  next();
});

// Call calcAverageRating after finding and updating
reviewSchema.post('findOneAndUpdate', async function() {
  await this.model.calcAverageRating(this.getQuery().listing);
});

module.exports = mongoose.model("Review", reviewSchema);
