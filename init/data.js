const mongoose = require("mongoose");
const Listing = require("../models/listing");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const sampleListings = [
  // BEACH PROPERTIES
  {
    title: "Luxury Beach Villa in Goa",
    description: "Wake up to the sound of waves in this stunning beachfront villa. Features a private pool, modern amenities, and direct beach access. Perfect for families and groups looking for a luxurious coastal getaway.",
    image: {
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
      filename: "beach-villa-goa"
    },
    price: 8500,
    location: "Candolim",
    country: "India",
    category: "Beach",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 15.5183,
    longitude: 73.7630
  },
  {
    title: "Cozy Beach Cottage",
    description: "A charming cottage right on the beach with spectacular sunset views. Ideal for couples seeking a romantic escape by the sea.",
    image: {
      url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      filename: "beach-cottage"
    },
    price: 3500,
    location: "Varkala",
    country: "India",
    category: "Beach",
    bedrooms: 2,
    bathrooms: 1,
    beds: 2,
    guests: 4,
    latitude: 8.7380,
    longitude: 76.7160
  },
  {
    title: "Beachfront Paradise Resort",
    description: "Luxurious resort-style accommodation with infinity pool overlooking the ocean. Includes spa services, private chef, and water sports facilities.",
    image: {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
      filename: "beach-resort"
    },
    price: 12000,
    location: "Puri",
    country: "India",
    category: "Beach",
    bedrooms: 5,
    bathrooms: 4,
    beds: 6,
    guests: 10,
    latitude: 19.8135,
    longitude: 85.8312
  },
  {
    title: "Tropical Beach Hut",
    description: "Traditional beach hut with modern amenities. Experience authentic coastal living with all the comforts you need.",
    image: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      filename: "beach-hut"
    },
    price: 2000,
    location: "Kovalam",
    country: "India",
    category: "Beach",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 8.4004,
    longitude: 76.9790
  },

  // MOUNTAIN CABINS
  {
    title: "Mountain View Cabin",
    description: "Stunning cabin nestled in the Himalayas with panoramic mountain views. Features a fireplace, wooden interiors, and hiking trails nearby.",
    image: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      filename: "mountain-cabin"
    },
    price: 4500,
    location: "Manali",
    country: "India",
    category: "Mountains",
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
    guests: 6,
    latitude: 32.2396,
    longitude: 77.1887
  },
  {
    title: "Alpine Cottage Retreat",
    description: "Cozy alpine cottage perfect for winter getaways. Enjoy skiing, snowboarding, and warm fireside evenings.",
    image: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      filename: "alpine-cottage"
    },
    price: 5500,
    location: "Shimla",
    country: "India",
    category: "Mountains",
    bedrooms: 2,
    bathrooms: 2,
    beds: 3,
    guests: 4,
    latitude: 31.1048,
    longitude: 77.1734
  },
  {
    title: "Himalayan Stone House",
    description: "Traditional stone house with modern amenities offering breathtaking valley views. Perfect for meditation and yoga retreats.",
    image: {
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
      filename: "stone-house"
    },
    price: 6000,
    location: "Dharamshala",
    country: "India",
    category: "Mountains",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 32.2190,
    longitude: 76.3234
  },
  {
    title: "Mountain Peak Lodge",
    description: "Luxury lodge at high altitude with spectacular sunrise views. Includes heated floors, jacuzzi, and gourmet kitchen.",
    image: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      filename: "peak-lodge"
    },
    price: 9000,
    location: "Mussoorie",
    country: "India",
    category: "Mountains",
    bedrooms: 5,
    bathrooms: 4,
    beds: 6,
    guests: 10,
    latitude: 30.4598,
    longitude: 78.0644
  },

  // CITY APARTMENTS
  {
    title: "Modern Loft Downtown",
    description: "Stylish loft in the heart of the city with skyline views. Walking distance to restaurants, shops, and entertainment.",
    image: {
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
      filename: "city-loft"
    },
    price: 5000,
    location: "Mumbai",
    country: "India",
    category: "City",
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    guests: 4,
    latitude: 19.0760,
    longitude: 72.8777
  },
  {
    title: "Luxury Penthouse Suite",
    description: "Top-floor penthouse with 360-degree city views, private terrace, and premium furnishings. Ultimate urban luxury.",
    image: {
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      filename: "penthouse"
    },
    price: 15000,
    location: "Delhi",
    country: "India",
    category: "City",
    bedrooms: 4,
    bathrooms: 3,
    beds: 4,
    guests: 6,
    latitude: 28.7041,
    longitude: 77.1025
  },
  {
    title: "Boutique City Studio",
    description: "Compact, stylish studio apartment perfect for solo travelers or couples. Modern design with smart home features.",
    image: {
      url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      filename: "studio"
    },
    price: 2500,
    location: "Bangalore",
    country: "India",
    category: "City",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    title: "Heritage City Apartment",
    description: "Restored heritage apartment blending old-world charm with modern comfort. Located in historic district.",
    image: {
      url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      filename: "heritage-apt"
    },
    price: 4000,
    location: "Jaipur",
    country: "India",
    category: "City",
    bedrooms: 3,
    bathrooms: 2,
    beds: 3,
    guests: 6,
    latitude: 26.9124,
    longitude: 75.7873
  },

  // CABINS
  {
    title: "Lakeside Log Cabin",
    description: "Rustic log cabin on a serene lake. Perfect for fishing, kayaking, and peaceful nature retreats.",
    image: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      filename: "log-cabin"
    },
    price: 3800,
    location: "Nainital",
    country: "India",
    category: "Cabins",
    bedrooms: 2,
    bathrooms: 1,
    beds: 3,
    guests: 4,
    latitude: 29.3803,
    longitude: 79.4636
  },
  {
    title: "Forest Hideaway Cabin",
    description: "Secluded cabin deep in the forest. Ideal for digital detox and reconnecting with nature.",
    image: {
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
      filename: "forest-cabin"
    },
    price: 3200,
    location: "Coorg",
    country: "India",
    category: "Cabins",
    bedrooms: 2,
    bathrooms: 1,
    beds: 2,
    guests: 4,
    latitude: 12.3375,
    longitude: 75.8069
  },
  {
    title: "Riverside Wooden Cabin",
    description: "Charming wooden cabin by a flowing river. Listen to the water while enjoying modern comforts.",
    image: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      filename: "riverside-cabin"
    },
    price: 4200,
    location: "Rishikesh",
    country: "India",
    category: "Cabins",
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
    guests: 6,
    latitude: 30.0869,
    longitude: 78.2676
  },

  // CASTLES
  {
    title: "Royal Heritage Castle",
    description: "Live like royalty in this restored medieval castle. Features grand halls, antique furnishings, and sprawling gardens.",
    image: {
      url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98",
      filename: "castle"
    },
    price: 25000,
    location: "Rajasthan",
    country: "India",
    category: "Castles",
    bedrooms: 8,
    bathrooms: 6,
    beds: 10,
    guests: 16,
    latitude: 27.0238,
    longitude: 74.2179
  },
  {
    title: "Fort Palace Suite",
    description: "Luxurious suite within a historic fort. Experience royal treatment with butler service and traditional cuisine.",
    image: {
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
      filename: "fort-palace"
    },
    price: 18000,
    location: "Jodhpur",
    country: "India",
    category: "Castles",
    bedrooms: 5,
    bathrooms: 4,
    beds: 6,
    guests: 10,
    latitude: 26.2389,
    longitude: 73.0243
  },

  // CAMPING
  {
    title: "Luxury Glamping Tent",
    description: "Experience camping in luxury with this fully-equipped glamping tent. Includes proper bed, electricity, and private bathroom.",
    image: {
      url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
      filename: "glamping"
    },
    price: 2800,
    location: "Lonavala",
    country: "India",
    category: "Camping",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 18.7537,
    longitude: 73.4086
  },
  {
    title: "Riverside Camping Site",
    description: "Peaceful camping spot by the river with bonfire area. Perfect for adventure seekers and nature lovers.",
    image: {
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      filename: "riverside-camp"
    },
    price: 1500,
    location: "Bir Billing",
    country: "India",
    category: "Camping",
    bedrooms: 1,
    bathrooms: 1,
    beds: 2,
    guests: 3,
    latitude: 32.0524,
    longitude: 76.7246
  },

  // FARMS
  {
    title: "Organic Farm Stay",
    description: "Experience farm life with organic vegetable gardens, farm animals, and fresh farm-to-table meals.",
    image: {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
      filename: "farm-stay"
    },
    price: 3000,
    location: "Mahabaleshwar",
    country: "India",
    category: "Farms",
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
    guests: 6,
    latitude: 17.9244,
    longitude: 73.6577
  },
  {
    title: "Vineyard Farmhouse",
    description: "Beautiful farmhouse surrounded by vineyards. Includes wine tasting, countryside views, and farm activities.",
    image: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      filename: "vineyard"
    },
    price: 7000,
    location: "Nashik",
    country: "India",
    category: "Farms",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 19.9975,
    longitude: 73.7898
  },

  // TRENDING
  {
    title: "Instagram-worthy Villa",
    description: "Stunning modern villa designed for the perfect photo. Features infinity pool, minimalist design, and trending aesthetics.",
    image: {
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
      filename: "insta-villa"
    },
    price: 10000,
    location: "Alibaug",
    country: "India",
    category: "Trending",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 18.6414,
    longitude: 72.8722
  },
  {
    title: "Viral TreeHouse Experience",
    description: "The most talked-about treehouse on social media. Unique architecture with luxury amenities high in the trees.",
    image: {
      url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
      filename: "viral-treehouse"
    },
    price: 8500,
    location: "Wayanad",
    country: "India",
    category: "Trending",
    bedrooms: 2,
    bathrooms: 2,
    beds: 2,
    guests: 4,
    latitude: 11.6854,
    longitude: 76.1320
  },

  // COUNTRYSIDE
  {
    title: "Tuscan-style Villa",
    description: "Peaceful countryside villa with olive groves and rolling hills. Perfect for relaxation and wine tasting.",
    image: {
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      filename: "tuscan-villa"
    },
    price: 6500,
    location: "Pune Countryside",
    country: "India",
    category: "Countryside",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 18.5204,
    longitude: 73.8567
  },

  // TINY HOMES
  {
    title: "Minimalist Tiny Home",
    description: "Beautifully designed tiny home with clever space-saving solutions. Perfect for minimalist living experience.",
    image: {
      url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f",
      filename: "tiny-home"
    },
    price: 2200,
    location: "Gokarna",
    country: "India",
    category: "Tiny Homes",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 14.5426,
    longitude: 74.3188
  },

  // LAKEFRONT
  {
    title: "Premium Lakefront Villa",
    description: "Luxurious villa right on the lake with private dock. Includes boat, water sports equipment, and stunning views.",
    image: {
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
      filename: "lakefront-villa"
    },
    price: 11000,
    location: "Udaipur",
    country: "India",
    category: "Lakefront",
    bedrooms: 5,
    bathrooms: 4,
    beds: 6,
    guests: 10,
    latitude: 24.5854,
    longitude: 73.7125
  },

  // DOMES
  {
    title: "Geodesic Dome Experience",
    description: "Unique geodesic dome with transparent ceiling for stargazing. Modern eco-friendly design meets comfort.",
    image: {
      url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
      filename: "geodesic-dome"
    },
    price: 5500,
    location: "Spiti Valley",
    country: "India",
    category: "Domes",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 32.2466,
    longitude: 78.0414
  },

  // OMG! (Unique/Unusual)
  {
    title: "Converted Airplane Suite",
    description: "Stay in a real airplane converted into luxury accommodation. Unique experience with aviation theme throughout.",
    image: {
      url: "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7",
      filename: "airplane-suite"
    },
    price: 12000,
    location: "Lonavala",
    country: "India",
    category: "OMG!",
    bedrooms: 2,
    bathrooms: 2,
    beds: 3,
    guests: 4,
    latitude: 18.7537,
    longitude: 73.4086
  },
  {
    title: "Underwater Room Experience",
    description: "Sleep surrounded by marine life in this partially underwater room. Truly once-in-a-lifetime experience.",
    image: {
      url: "https://images.unsplash.com/photo-1582719508461-905c673771fd",
      filename: "underwater"
    },
    price: 35000,
    location: "Lakshadweep",
    country: "India",
    category: "OMG!",
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    guests: 2,
    latitude: 10.5667,
    longitude: 72.6417
  },

  // BOATS
  {
    title: "Luxury Houseboat",
    description: "Traditional Kerala houseboat with modern amenities. Cruise through backwaters while enjoying local cuisine.",
    image: {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
      filename: "houseboat"
    },
    price: 9000,
    location: "Alleppey",
    country: "India",
    category: "Boats",
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
    guests: 6,
    latitude: 9.4981,
    longitude: 76.3388
  },

  // ARCTIC (Hill Stations)
  {
    title: "Snow Mountain Chalet",
    description: "Cozy chalet in snow-covered mountains. Perfect for winter sports enthusiasts and snow lovers.",
    image: {
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      filename: "snow-chalet"
    },
    price: 7500,
    location: "Gulmarg",
    country: "India",
    category: "Arctic",
    bedrooms: 3,
    bathrooms: 2,
    beds: 4,
    guests: 6,
    latitude: 34.0484,
    longitude: 74.3805
  },

  // NATIONAL PARKS
  {
    title: "Wildlife Safari Lodge",
    description: "Luxury lodge at the edge of national park. Wake up to wildlife views and enjoy guided safari tours.",
    image: {
      url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972",
      filename: "safari-lodge"
    },
    price: 13000,
    location: "Jim Corbett",
    country: "India",
    category: "National Parks",
    bedrooms: 4,
    bathrooms: 3,
    beds: 5,
    guests: 8,
    latitude: 29.5309,
    longitude: 78.7763
  }
];

async function seedDB() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to DB");

    console.log("🧹 Clearing old listings...");
    await Listing.deleteMany({});

    console.log("📦 Inserting sample listings...");
    
    // Get the first user to assign as author
    const User = require("../models/user");
    let defaultUser = await User.findOne({});
    
    if (!defaultUser) {
      console.log("⚠️  No users found. Creating default user...");
      defaultUser = new User({
        username: "admin",
        email: "admin@wanderlust.com"
      });
      await User.register(defaultUser, "admin123");
    }
    
    // Add author to all listings
    const listingsWithAuthor = sampleListings.map(listing => ({
      ...listing,
      author: defaultUser._id
    }));
    
    await Listing.insertMany(listingsWithAuthor);

    console.log(`🎉 Database seeded successfully with ${sampleListings.length} listings!`);
  } catch (err) {
    console.error("❌ Error while seeding DB:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 DB connection closed");
  }
}

seedDB();