// Backfill script to add coordinates to existing listings
// Run with: node scripts/backfill-coordinates.js

require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const { geocodeLocation } = require('../util/geocoding');

async function backfillCoordinates() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    console.log('Connected to MongoDB');

    // Find all listings without coordinates
    const listingsWithoutCoords = await Listing.find({
      $or: [
        { latitude: { $exists: false } },
        { latitude: null },
        { geometry: { $exists: false } },
        { geometry: null }
      ]
    });

    console.log(`Found ${listingsWithoutCoords.length} listings without coordinates`);

    let successCount = 0;
    let failCount = 0;

    for (const listing of listingsWithoutCoords) {
      const location = `${listing.location}, ${listing.country}`;
      console.log(`\nProcessing: ${listing.title}`);
      console.log(`  Location: ${location}`);

      const geoResult = await geocodeLocation(location);

      if (geoResult) {
        listing.geometry = geoResult.geometry;
        listing.latitude = geoResult.latitude;
        listing.longitude = geoResult.longitude;
        await listing.save();
        console.log(`  ✅ Success! Lat: ${geoResult.latitude.toFixed(4)}, Lng: ${geoResult.longitude.toFixed(4)}`);
        successCount++;
      } else {
        console.log(`  ❌ Failed to geocode`);
        failCount++;
      }

      // Rate limiting - Mapbox has rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=================================');
    console.log(`Completed!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log('=================================\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

backfillCoordinates();

