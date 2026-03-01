const Listing = require("../models/listing");

module.exports = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing || !listing.author.equals(req.user._id)) {
    req.flash("error", "Permission denied");
    return res.redirect("/listings");
  }
  next();
};
