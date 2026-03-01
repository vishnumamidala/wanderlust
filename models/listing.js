const mongoose = require("mongoose");
const Review = require("./review");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 2000
  },
  image: {
    url: {
      type: String,
      default: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    }
  },
  images: [{ url: String, filename: String }],
  price: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  category: {
    type: String,
    enum: [
      'Beach', 'Cabins', 'Trending', 'City', 'Mountains', 'Castles',
      'Camping', 'Farms', 'Arctic', 'Domes', 'Boats', 'Lakefront',
      'Countryside', 'Tiny Homes', 'OMG!', 'National Parks'
    ]
  },
  bedrooms: {
    type: Number,
    default: 1,
    min: 1
  },
  bathrooms: {
    type: Number,
    default: 1,
    min: 1
  },
  beds: {
    type: Number,
    default: 1,
    min: 1
  },
  guests: {
    type: Number,
    default: 2,
    min: 1
  },
  amenities: [String],
  houseRules: [String],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'flexible'
  },
  instantBook: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  }]
}, { timestamps: true });

// Virtual for average rating - computed from actual reviews
listingSchema.virtual("avgRating").get(function () {
  return this.avgRatingValue || 0;
});

// Virtual for review count
listingSchema.virtual("reviewCount").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

// Index for geospatial queries (only if coordinates exist)
// listingSchema.index({ geometry: "2dsphere" });
listingSchema.index({ category: 1, price: 1 });
listingSchema.index({ author: 1 });

// Pre-save middleware to compute rating
listingSchema.pre('save', async function() {
  if (this.isModified('reviews')) {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ _id: { $in: this.reviews } });
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
      this.avgRatingValue = Math.round((total / reviews.length) * 10) / 10;
    } else {
      this.avgRatingValue = 0;
    }
  }
});

// Static method to compute average rating
listingSchema.statics.computeAverageRating = async function(listingId) {
  const listing = await this.findById(listingId).populate('reviews');
  if (listing && listing.reviews.length > 0) {
    const total = listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const avg = Math.round((total / listing.reviews.length) * 10) / 10;
    await this.findByIdAndUpdate(listingId, { avgRatingValue: avg });
  } else {
    await this.findByIdAndUpdate(listingId, { avgRatingValue: 0 });
  }
};

// Middleware to update listing rating when review is added/removed
listingSchema.post('save', function() {
  mongoose.model('Listing').computeAverageRating(this._id);
});

listingSchema.post('remove', function(doc) {
  mongoose.model('Listing').computeAverageRating(doc._id);
});

// Cascade delete reviews when listing is deleted
listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await mongoose.model('Review').deleteMany({ _id: { $in: doc.reviews } });
  }
});

listingSchema.set("toJSON", { virtuals: true });
listingSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Listing", listingSchema);
