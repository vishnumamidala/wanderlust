const mongoose = require('mongoose');
const Listing = require('./models/listing');
const Review = require('./models/review');
const User = require('./models/user');

// This script backfills author fields for existing listings and reviews
// Run with: node scripts/backfill-authors.js

async function backfillAuthors() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    console.log('Connected to DB');

    // Get first user (or create a default one)
    let defaultUser = await User.findOne({});
    if (!defaultUser) {
      console.log('No users found. Creating a default user...');
      defaultUser = new User({
        username: 'admin',
        email: 'admin@wanderlust.com'
      });
      await User.register(defaultUser, 'admin123');
      console.log('Default user created');
    }

    // Backfill listings without author
    const listingsWithoutAuthor = await Listing.find({ author: null });
    console.log(`Found ${listingsWithoutAuthor.length} listings without author`);
    
    if (listingsWithoutAuthor.length > 0) {
      await Listing.updateMany(
        { author: null },
        { author: defaultUser._id }
      );
      console.log(`Updated ${listingsWithoutAuthor.length} listings with author`);
    }

    // Backfill reviews without author
    const reviewsWithoutAuthor = await Review.find({ author: null });
    console.log(`Found ${reviewsWithoutAuthor.length} reviews without author`);
    
    if (reviewsWithoutAuthor.length > 0) {
      await Review.updateMany(
        { author: null },
        { author: defaultUser._id }
      );
      console.log(`Updated ${reviewsWithoutAuthor.length} reviews with author`);
    }

    console.log('Backfill completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during backfill:', err);
    process.exit(1);
  }
}

backfillAuthors();
