const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderlust",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

// Error handling middleware for multer
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      req.flash('error', 'File too large. Maximum size is 5MB.');
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      req.flash('error', 'Too many files. Maximum is 10.');
    } else {
      req.flash('error', err.message);
    }
    return res.redirect('back');
  }
  if (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  next();
};

module.exports = upload;
module.exports.handleMulterErrors = handleMulterErrors;
