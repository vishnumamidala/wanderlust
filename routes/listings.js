const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../util/wrapAsync");
const isLoggedIn = require("../util/isLoggedIn");
const isAuthor = require("../util/isAuthor");
const upload = require("../middleware/multer");

const ITEMS_PER_PAGE = 12;

// ================== HELPER: COMPUTE RATING ==================
async function computeRating(listing) {
  if (!listing.reviews || listing.reviews.length === 0) {
    listing.avgRatingValue = 0;
    listing.reviewCount = 0;
    return;
  }

  const reviews = await Review.find({ _id: { $in: listing.reviews } });

  if (reviews.length > 0) {
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    listing.avgRatingValue =
      Math.round((total / reviews.length) * 10) / 10;
    listing.reviewCount = reviews.length;
  } else {
    listing.avgRatingValue = 0;
    listing.reviewCount = 0;
  }
}

// ================== INDEX (ENHANCED) ==================
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const {
      category,
      location,
      sort,
      price,
      guests,
      search,
      minPrice,
      maxPrice,
      page = 1
    } = req.query;

    let query = {};

    // ===== CATEGORY FILTER =====
    if (category && category !== "all") {
      query.category = category;
    }

    // ===== SEARCH (TITLE OR LOCATION) =====
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    // ===== LOCATION FILTER (existing) =====
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // ===== OLD PRICE BUCKET FILTER =====
    if (price) {
      if (price === "0-1000") {
        query.price = { $lte: 1000 };
      } else if (price === "1000-5000") {
        query.price = { $gt: 1000, $lte: 5000 };
      } else if (price === "5000-10000") {
        query.price = { $gt: 5000, $lte: 10000 };
      } else if (price === "10000+") {
        query.price = { $gt: 10000 };
      }
    }

    // ===== ADVANCED MIN/MAX PRICE FILTER =====
    if (minPrice || maxPrice) {
      query.price = query.price || {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // ===== GUEST FILTER =====
    if (guests) {
      query.guests = { $gte: parseInt(guests) };
    }

    // ===== SORTING =====
    let sortOption = { createdAt: -1 };

    if (sort === "price-low" || sort === "price_asc") {
      sortOption = { price: 1 };
    }

    if (sort === "price-high" || sort === "price_desc") {
      sortOption = { price: -1 };
    }

    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const listings = await Listing.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(ITEMS_PER_PAGE)
      .populate("author")
      .populate("reviews");

    // Compute ratings
    for (const listing of listings) {
      await computeRating(listing);
    }

    const totalListings = await Listing.countDocuments(query);
    const totalPages = Math.ceil(totalListings / ITEMS_PER_PAGE);

    res.render("listings/index", {
      allListings: listings,
      category,
      location,
      sort,
      priceRange: price,
      guestsFilter: guests,
      search,
      minPrice,
      maxPrice,
      currentPage,
      totalPages,
    });
  })
);

// ================== NEW ==================
router.get("/new", isLoggedIn, (req, res) => {
  const categories =
    Listing.schema.path("category").enumValues || [];

  res.render("listings/new", { categories });
});

// ================== CREATE ==================
router.post(
  "/",
  isLoggedIn,
  upload.array("images", 10),
  wrapAsync(async (req, res) => {
    const listingData = req.body.listing;

    listingData.price = parseFloat(listingData.price) || 0;
    listingData.bedrooms = parseInt(listingData.bedrooms) || 1;
    listingData.bathrooms = parseFloat(listingData.bathrooms) || 1;
    listingData.beds = parseInt(listingData.beds) || 1;
    listingData.guests = parseInt(listingData.guests) || 2;

    const listing = new Listing(listingData);
    listing.author = req.user._id;

    if (req.files && req.files.length > 0) {
      listing.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));

      listing.image.url = req.files[0].path;
    }

    await listing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// ================== SHOW ==================
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    await computeRating(listing);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    listing.reviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    res.render("listings/show", {
      listing,
      avgRating: listing.avgRatingValue || 0,
      reviewCount: listing.reviewCount || 0,
      ratingDistribution,
    });
  })
);

// ================== EDIT ==================
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const categories =
      Listing.schema.path("category").enumValues || [];

    res.render("listings/edit", { listing, categories });
  })
);

// ================== UPDATE ==================
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("images", 10),
  wrapAsync(async (req, res) => {
    const listingData = req.body.listing;

    listingData.price = parseFloat(listingData.price) || 0;
    listingData.bedrooms = parseInt(listingData.bedrooms) || 1;
    listingData.bathrooms = parseFloat(listingData.bathrooms) || 1;
    listingData.beds = parseInt(listingData.beds) || 1;
    listingData.guests = parseInt(listingData.guests) || 2;

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      listingData,
      { new: true }
    );

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
      }));

      listing.images.push(...newImages);

      if (listing.images.length === newImages.length) {
        listing.image.url = newImages[0].url;
      }
    }

    await listing.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${listing._id}`);
  })
);

// ================== DELETE ==================
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
