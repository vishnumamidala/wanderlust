const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().trim().required(),
    country: Joi.string().trim().required(),
    category: Joi.string().valid(
      'Beachfront',
      'Cabins',
      'Trending',
      'City',
      'Mountains',
      'Countryside',
      'Tiny homes',
      'OMG!',
      'Arctic',
      'Camping',
      'Castles',
      'Farms',
      'Desert',
      'Barns',
      'Lakefront',
      'Islands',
      'National parks',
      'Vineyards',
      'Boats',
      'Skiing',
      'Cycladic homes',
      'Earth homes',
      'Golfing',
      'Surfing',
      'Bed & breakfasts',
      'Historical homes',
      'Tropical',
      'A-frames',
      'Domes',
      'Houseboats',
      'Adapted',
      'Minsus',
      'Containers',
      'Yurts',
      'Creative spaces',
      'Riads',
      'Dammusi',
      'Trulli',
      'Cave',
      'Windmills',
      'Towers',
      'Shepherd\'s huts',
      'Casas particulares',
      'Ryokans',
      'Hanoks',
      'Lighthouse',
      'Treehouses'
    ).required(),
    image: Joi.object({
      url: Joi.string().uri().allow("", null)
    }).optional()
  }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(10).max(500).required()
  }).required()
});

