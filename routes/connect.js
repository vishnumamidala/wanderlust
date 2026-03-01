const express = require("express");
const router = express.Router();
const stripe = require("../config/stripe");
const User = require("../models/user");
const isLoggedIn = require("../util/isLoggedIn");

// ================= BECOME HOST ENTRY POINT =================
router.get("/", isLoggedIn, async (req, res) => {
  try {
    // If user already has Stripe account
    if (req.user.stripeAccountId) {
      return res.redirect("/connect/onboarding");
    }

    // Otherwise create new account
    const account = await stripe.accounts.create({
      type: "express",
      email: req.user.email,
    });

    req.user.stripeAccountId = account.id;
    await req.user.save();

    res.redirect("/connect/onboarding");

  } catch (err) {
    console.error("Stripe account creation error:", err.message);
    req.flash("error", "Stripe account creation failed.");
    res.redirect("/dashboard/host");
  }
});


// ================= ONBOARDING =================
router.get("/onboarding", isLoggedIn, async (req, res) => {
  try {
    if (!req.user.stripeAccountId) {
      return res.redirect("/connect");
    }

    const account = await stripe.accounts.retrieve(
      req.user.stripeAccountId
    );

    // If already completed onboarding
    if (account.details_submitted) {
      return res.redirect("/dashboard/host");
    }

    const accountLink = await stripe.accountLinks.create({
      account: req.user.stripeAccountId,
      refresh_url: "http://localhost:3000/connect",
      return_url: "http://localhost:3000/dashboard/host",
      type: "account_onboarding",
    });

    res.redirect(accountLink.url);

  } catch (err) {
    console.error("Stripe onboarding error:", err.message);
    req.flash("error", "Stripe onboarding failed.");
    res.redirect("/dashboard/host");
  }
});

module.exports = router;
