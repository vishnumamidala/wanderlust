const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");
const isLoggedIn = require("../util/isLoggedIn");
const wrapAsync = require("../util/wrapAsync");

// Get all wishlists for current user
router.get("/", isLoggedIn, wrapAsync(async (req, res, next) => {
  const wishlists = await Wishlist.find({ user: req.user._id })
    .populate({
      path: "listings",
      populate: { path: "author" }
    })
    .sort({ createdAt: -1 });
  res.render("users/wishlists", { wishlists });
}));

// Create a new wishlist
router.post("/", isLoggedIn, wrapAsync(async (req, res, next) => {
  const { name } = req.body;
  const wishlist = new Wishlist({
    user: req.user._id,
    name: name || "My Wishlist",
    listings: []
  });
  await wishlist.save();
  req.flash("success", "Wishlist created!");
  res.redirect("/wishlists");
}));

// Quick add to default wishlist (with AJAX support)
router.post("/add/:listingId", isLoggedIn, wrapAsync(async (req, res, next) => {
  // Check if AJAX request
  const isAjax = req.headers.accept && req.headers.accept.includes('application/json');
  
  // Find or create default wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id, isDefault: true });
  
  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      name: "My Wishlist",
      isDefault: true,
      listings: []
    });
  }
  
  // Check if already in wishlist
  if (!wishlist.listings.includes(req.params.listingId)) {
    wishlist.listings.push(req.params.listingId);
    await wishlist.save();
    
    if (isAjax) {
      return res.json({ success: true, action: 'added', message: 'Added to wishlist!' });
    }
    req.flash("success", "Added to wishlist!");
  } else {
    // Remove from wishlist if already added
    wishlist.listings = wishlist.listings.filter(
      id => id.toString() !== req.params.listingId
    );
    await wishlist.save();
    
    if (isAjax) {
      return res.json({ success: true, action: 'removed', message: 'Removed from wishlist' });
    }
    req.flash("success", "Removed from wishlist");
  }
  
  res.redirect(`/listings/${req.params.listingId}`);
}));

// Get wishlist status for a user (for AJAX calls)
router.get("/status", isLoggedIn, wrapAsync(async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id, isDefault: true });
    
    if (wishlist) {
      res.json({ success: true, wishlist: { listings: wishlist.listings.map(id => id.toString()) } });
    } else {
      res.json({ success: true, wishlist: { listings: [] } });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
}));

// Remove listing from wishlist
router.post("/:wishlistId/remove/:listingId", isLoggedIn, wrapAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findById(req.params.wishlistId);
  
  if (!wishlist) {
    req.flash("error", "Wishlist not found");
    return res.redirect("/wishlists");
  }
  
  if (!wishlist.user.equals(req.user._id)) {
    req.flash("error", "Not authorized");
    return res.redirect("/wishlists");
  }
  
  wishlist.listings = wishlist.listings.filter(
    id => id.toString() !== req.params.listingId
  );
  await wishlist.save();
  req.flash("success", "Removed from wishlist");
  res.redirect("/wishlists");
}));

// Delete wishlist
router.post("/:wishlistId/delete", isLoggedIn, wrapAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findById(req.params.wishlistId);
  
  if (!wishlist) {
    req.flash("error", "Wishlist not found");
    return res.redirect("/wishlists");
  }
  
  if (!wishlist.user.equals(req.user._id)) {
    req.flash("error", "Not authorized");
    return res.redirect("/wishlists");
  }
  
  await Wishlist.findByIdAndDelete(req.params.wishlistId);
  req.flash("success", "Wishlist deleted");
  res.redirect("/wishlists");
}));

module.exports = router;

