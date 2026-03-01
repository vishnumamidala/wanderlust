const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const isLoggedIn = require("../util/isLoggedIn");
console.log("Dashboard route file loaded");

// ================= HOST DASHBOARD =================
router.get("/host", isLoggedIn, async (req, res) => {
  try {
    // ================= TOTAL LISTINGS =================
    const totalListings = await Listing.countDocuments({
      author: req.user._id
    });

    // ================= CONFIRMED BOOKINGS =================
    const bookings = await Booking.find({
      status: "confirmed",
      paymentStatus: "paid"
    }).populate("listing guest");

    // Filter bookings belonging to this host
    const hostBookings = bookings.filter(b =>
      b.listing && b.listing.author.equals(req.user._id)
    );

    // ================= TOTAL REVENUE =================
    const totalRevenue = hostBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    // ================= UPCOMING BOOKINGS =================
    const today = new Date();
    const upcomingBookings = hostBookings.filter(
      b => new Date(b.checkIn) >= today
    );

    // ================= MONTHLY REVENUE =================
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          paymentStatus: "paid"
        }
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing",
          foreignField: "_id",
          as: "listing"
        }
      },
      { $unwind: "$listing" },
      {
        $match: {
          "listing.author": req.user._id
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.render("dashboard/host", {
      totalListings,
      totalRevenue,
      upcomingCount: upcomingBookings.length,
      bookings: hostBookings,
      monthlyRevenue
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load dashboard.");
    res.redirect("/");
  }
});
router.get("/host", (req, res) => {
  console.log("HOST ROUTE HIT");
  res.send("Host route working");
});


module.exports = router;
