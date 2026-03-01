const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");
const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Wishlist = require("../models/wishlist");

// ==================== LOGIN/REGISTER ====================

router.get("/login", (req, res) => {
  res.render("users/login");
});
router.post("/login", passport.authenticate("local", {
  failureRedirect: "/users/login",
  failureFlash: true
}), wrapAsync(async (req, res, next) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}));

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", wrapAsync(async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/register");
  }
}));

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/listings");
  });
});

// ==================== PROFILE ====================

router.get("/profile", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  
  const myListingsCount = await Listing.countDocuments({ author: req.user._id });
  const wishlistsCount = await Wishlist.countDocuments({ user: req.user._id });
  const bookingsCount = await Booking.countDocuments({ user: req.user._id });
  
  res.render("users/profile", {
    currentUser: req.user,
    myListingsCount,
    wishlistsCount,
    bookingsCount
  });
}));

router.get("/edit-profile", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  res.render("users/edit-profile", { currentUser: req.user });
}));

router.post("/edit-profile", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  
  const { username, email } = req.body;
  
  const existingUser = await User.findOne({
    $or: [
      { username: username, _id: { $ne: req.user._id } },
      { email: email, _id: { $ne: req.user._id } }
    ]
  });
  
  if (existingUser) {
    req.flash("error", "Username or email is already taken");
    return res.redirect("/users/edit-profile");
  }
  
  await User.findByIdAndUpdate(req.user._id, { username, email });
  req.flash("success", "Profile updated successfully");
  res.redirect("/users/profile");
}));

router.get("/change-password", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  res.render("users/change-password", { currentUser: req.user });
}));

router.post("/change-password", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  
  const { currentPassword, newPassword, confirmPassword } = req.body;
  
  if (newPassword !== confirmPassword) {
    req.flash("error", "New passwords do not match");
    return res.redirect("/users/change-password");
  }
  
  if (newPassword.length < 6) {
    req.flash("error", "Password must be at least 6 characters");
    return res.redirect("/users/change-password");
  }
  
  try {
    await req.user.changePassword(currentPassword, newPassword);
    await req.user.save();
    req.flash("success", "Password changed successfully");
    res.redirect("/users/profile");
  } catch (e) {
    req.flash("error", "Current password is incorrect");
    res.redirect("/users/change-password");
  }
}));

router.get("/my-listings", wrapAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }
  
  const listings = await Listing.find({ author: req.user._id })
    .populate("author")
    .populate("reviews");
  
  res.render("users/my-listings", { 
    allListings: listings, 
    currentUser: req.user 
  });
}));

module.exports = router;

