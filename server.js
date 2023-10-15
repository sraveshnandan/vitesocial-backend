//Loading all env variables
require("dotenv").config();

//Importing required modules

const express = require("express");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const filUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
//Importing Database connection function
const db = require("./config/db");
//configuring express
const app = express();
//Middlewares
app.use(
  filUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));

//Importing routes
const serverStatusRoute = require("./routes/serverStatusRoute");
const UserRoutes = require("./routes/UserRoutes");
const PostRoutes = require("./routes/PostRoutes");

//Using Routes
app.use("", serverStatusRoute);
app.use("", UserRoutes);
app.use("", PostRoutes);

//Starting the server

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`);
});
