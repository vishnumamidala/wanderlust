const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for fast conflict detection
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });

// Virtual nights calculation
bookingSchema.virtual("nights").get(function () {
  if (this.checkIn && this.checkOut) {
    const diff = this.checkOut - this.checkIn;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Validate date logic
bookingSchema.pre("validate", function (next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error("Check-out must be after check-in"));
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
