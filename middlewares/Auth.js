const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.isLoggedIn = (req, res, next) => {
    try {
        //trying to get token
        const {token} = req.cookies;
        //if no token found

        if (!token) {
            return res.json({
                success: false,
                message: "no token found , please login first."
            })
        }
        //if any token exists
        //verifying token by privet key
        const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(` Log In middleware is working fine.`)
        // if token is expired


        req.user = decode._id;

        next();

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        })
    }

}