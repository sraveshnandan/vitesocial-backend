const cloudinary = require("cloudinary")
    .v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLINT_NAME,
    api_key: process.env.CLOUDINARY_CLINT_API_KEY,
    api_secret: process.env.CLOUDINARY_CLINT_API_SECRET,
});
module.exports = cloudinary;