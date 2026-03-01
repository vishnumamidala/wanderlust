const mongoose = require("mongoose");
const sampleListings = require("./data.js");
const Listing = require("../models/listing.js");

async function seedDB() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("MongoDB connected");

  await Listing.deleteMany({});
  await Listing.insertMany(sampleListings);

  console.log("✅ DATABASE SEEDED SUCCESSFULLY");
  process.exit();
}

seedDB().catch((err) => {
  console.log("❌ ERROR:", err);
});
