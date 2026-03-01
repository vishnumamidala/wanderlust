const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    default: "My Wishlist"
  },
  listings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing"
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

wishlistSchema.index({ user: 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);

