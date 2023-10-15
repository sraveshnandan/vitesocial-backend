// SDK initialization
var ImageKit = require("imagekit");

const dotenv = require("dotenv");
dotenv.config({
  path: "../.env",
});


const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVET_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL,
});

module.exports= imagekit;

