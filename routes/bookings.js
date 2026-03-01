const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const isLoggedIn = require("../util/isLoggedIn");


// =====================================================
// ================= USER TRIPS ========================
// =====================================================

router.get("/", isLoggedIn, async (req, res) => {
  try {

    // Auto-complete past bookings
    await Booking.updateMany(
      {
        guest: req.user._id,
        status: "confirmed",
        checkOut: { $lt: new Date() }
      },
      { status: "completed" }
    );

    const bookings = await Booking.find({ guest: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.render("bookings/index", { bookings });

  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load trips.");
    res.redirect("/");
  }
});


// =====================================================
// ================= SHOW BOOKING ======================
// =====================================================

router.get("/:id", isLoggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing");

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/bookings");
    }

    // Authorization check
    if (!booking.guest.equals(req.user._id)) {
      req.flash("error", "Unauthorized access.");
      return res.redirect("/bookings");
    }

    const nights =
      Math.ceil(
        (new Date(booking.checkOut) - new Date(booking.checkIn)) /
        (1000 * 60 * 60 * 24)
      );

    res.render("bookings/show", {
      booking,
      nights
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load booking.");
    res.redirect("/bookings");
  }
});


// =====================================================
// ================= HOST BOOKINGS =====================
// =====================================================

router.get("/host-bookings", isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "listing",
        match: { author: req.user._id }
      })
      .populate("guest")
      .sort({ createdAt: -1 });

    const filtered = bookings.filter(b => b.listing !== null);

    res.render("bookings/host", { bookings: filtered });

  } catch (err) {
    console.error(err);
    req.flash("error", "Could not load host bookings.");
    res.redirect("/");
  }
});


// =====================================================
// =========== CREATE BOOKING + STRIPE =================
// =====================================================

router.post("/:listingId", isLoggedIn, async (req, res) => {
  try {
    const { checkIn, checkOut, guests } = req.body;
    const listingId = req.params.listingId;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      req.flash("error", "Invalid date selection.");
      return res.redirect(`/listings/${listingId}`);
    }

    if (guests > listing.guests) {
      req.flash("error", "Guest count exceeds capacity.");
      return res.redirect(`/listings/${listingId}`);
    }

    const existingBooking = await Booking.findOne({
      listing: listingId,
      status: { $in: ["pending", "confirmed"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate }
    });

    if (existingBooking) {
      req.flash("error", "Dates already booked.");
      return res.redirect(`/listings/${listingId}`);
    }

    const nights =
      Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const totalPrice = nights * listing.price;

    const booking = new Booking({
      listing: listingId,
      guest: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: "pending",
      paymentStatus: "pending"
    });

    await booking.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
              description: `${nights} nights stay`
            },
            unit_amount: totalPrice * 100
          },
          quantity: 1
        }
      ],
      metadata: {
        bookingId: booking._id.toString()
      },
      success_url: `http://localhost:3000/bookings`,
      cancel_url: `http://localhost:3000/listings/${listingId}`
    });

    res.redirect(303, session.url);

  } catch (err) {
    console.error(err);
    req.flash("error", "Booking failed.");
    res.redirect("back");
  }
});


// =====================================================
// ================= CANCEL BOOKING ====================
// =====================================================

router.post("/:bookingId/cancel", isLoggedIn, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("back");
    }

    if (!booking.guest.equals(req.user._id)) {
      req.flash("error", "Unauthorized.");
      return res.redirect("back");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled.");
    res.redirect("/bookings");

  } catch (err) {
    console.error(err);
    req.flash("error", "Cancellation failed.");
    res.redirect("back");
  }
});


module.exports = router;
