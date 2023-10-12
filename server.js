//Loading all env variables
require("dotenv").config();

//Importing required modules

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
//Importing Database connection function
const db = require("./config/db");

const app = express();

//Middlewares
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}));
app.use(express.urlencoded({limit: "50mb", extended: true}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json({limit: "50mb"}));

//Importing routes
const UserRoutes = require("./routes/UserRoutes");
const PostRoutes = require("./routes/PostRoutes");

//Using Routes
app.use("", UserRoutes);
app.use("", PostRoutes);


//Starting the server

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${process.env.PORT}`)
})