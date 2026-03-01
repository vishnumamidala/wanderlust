require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./util/ExpressError");
const User = require("./models/user");
const Booking = require("./models/booking");
const stripe = require("./config/stripe");

// grab the atlas url from env and connect to mongodb
const dburl = process.env.ATLASDB_URL;

mongoose.connect(dburl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// stripe sends payment events to this endpoint
// important: this must come before express.json() otherwise the raw body gets parsed and stripe signature check fails
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    // verify the event actually came from stripe
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("❌ Webhook signature verification failed.");
      return res.sendStatus(400);
    }

    try {
      // when a user completes payment, confirm the booking and transfer money to the host
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;

        const booking = await Booking.findById(bookingId)
          .populate("listing")
          .populate("guest");

        if (!booking) {
          console.log("❌ Booking not found");
          return res.json({ received: true });
        }

        // mark booking as confirmed and paid
        booking.status = "confirmed";
        booking.paymentStatus = "paid";
        await booking.save();

        const host = await User.findById(booking.listing.author);

        // transfer the host's cut (90%) to their stripe account, we keep 10% as platform fee
        if (host && host.stripeAccountId) {
          const platformFee = Math.round(booking.totalPrice * 0.1 * 100);
          const transferAmount = booking.totalPrice * 100 - platformFee;

          try {
            await stripe.transfers.create({
              amount: transferAmount,
              currency: "inr",
              destination: host.stripeAccountId,
            });
            console.log("✅ Money transferred to host");
          } catch (transferErr) {
            console.log("❌ Transfer failed:", transferErr.message);
          }
        }

        console.log("✅ Booking confirmed via webhook");
      }
    } catch (err) {
      console.log("❌ Webhook handler error:", err.message);
    }

    // always send 200 back to stripe so it doesn't keep retrying
    res.json({ received: true });
  }
);

// set up ejs as the templating engine with ejs-mate for layouts
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// store sessions in mongodb so they survive server restarts
// touchAfter means we only update the session once every 24hrs unless something changes
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600
});

store.on("error", function(e) {
  console.log("Session store error:", e);
});

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(flash());

// set up passport for user login/logout
// local strategy means we're using username + password (not google/facebook etc.)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// make flash messages and current user available in all templates without passing them manually every time
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// all routes
app.get("/", (req, res) => res.redirect("/listings"));

app.use("/listings", require("./routes/listings"));
app.use("/listings/:id/reviews", require("./routes/reviews"));
app.use("/users", require("./routes/users"));
app.use("/bookings", require("./routes/bookings"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/connect", require("./routes/connect"));
app.use("/wishlists", require("./routes/wishlists"));

// if nothing above matched, it's a 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// central error handler — for api requests return json, otherwise render the error page
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);
  console.error("STACK:", err.stack);

  const { statusCode = 500, message = "Something went wrong" } = err;

  if (req.xhr || (req.headers.accept && req.headers.accept.indexOf("json") > -1)) {
    return res.status(statusCode).json({ error: message });
  }

  res.status(statusCode).render("error", {
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : null
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
