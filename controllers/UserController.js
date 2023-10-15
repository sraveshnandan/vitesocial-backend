const User = require("../models/User");
const Post = require("../models/Post");
const crypto = require("crypto");
const fs = require("fs");
const imagekit = require("../middlewares/ImageKit");

const nodemailer = require("nodemailer");

//have to add avatar data

//User Registration function
exports.registerUserFunction = async (req, res) => {
    try {
        //trying to get user registration details from body
        const {username, fullName, email, password} = req.body;

        //searching for any existing user details in database with same email id
        let user = await User.findOne({email});

        //if user's email already exists the returning a false responce
        if (user) {
            return res.status(590).json({
                success: false,
                message: "Email already exists.",
            });
        }
        //if user's email did'nt exists the creating a new users account with provided details
        console.log("Uploading started.");
        const avatar = req.files.avatar;
        //uploading img

        const upload = await imagekit.upload({
            file: fs.createReadStream(req.files.avatar.tempFilePath), //required
            fileName: "user_avatar.jpg", //required
        });
        console.log(upload);

        user = await User.create({
            username,
            fullName,
            email,
            password,
            avatar: {
                public_url: upload.url,
                public_id: upload.fileId,
            },
        });

        //sending responce if account is craeted

        res.status(201).json({
            success: true,
            message: "Account created.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//Nothing to be improved except cookie;

//User Login Function
exports.loginUserFunction = async (req, res) => {
    try {
        const {username, password} = req.body;
        //Finding user in database
        let user = await User.findOne({username}).select("password");
        //If user not exists
        if (!user) {
            return res.json({
                success: false,
                message: "No any account found.",
            });
        }
        //comparing password
        const isPassMatch = await user.matchPassword(password);
        //if password not matched
        if (!isPassMatch) {
            return res.json({
                success: false,
                message: "Invalid Credentials.",
            });
        }
        //if password matched
        //Generating auth token
        const token = user.generateAuthToken(user._id);
        console.log(" new Token generated.")
        //Sending final response if user logged in successfully

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Cookie expiration date
            httpOnly: true, // Cookie can only be accessed by the server
            secure: true, // Send the cookie over HTTPS only
            sameSite: 'none',

        };
        res
            .status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                message: "Log in success.",
            });
    } catch (error) {
        res.status(500).json({
            success: false, message: error.message
        })
    }
};

//Login Verification function
exports.getUserProfileFunction = async (req, res) => {
    try {
        //Finding user by id populating required fields
        let user = await User.findById(req.user).populate(
            "followers following posts"
        );
        //if no user found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found.",
            });
        }
        //if user found
        res.status(200).json({
            success: true,
            details: user,
            message: "Details fetched successfully.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//Log out Function
exports.logOutUserFunction = (req, res) => {
    try {
        res.status(200).clearCookie("token").json({
            success: true,
            message: "Logged Out.",
        });
    } catch (e) {
        ThrowError(res, e);
    }
};

//Follow or UnFollow user Function

exports.FollowOrUnfollowUserFunction = async (req, res) => {
    try {
        //Getting user from parameter

        //Searching for user in database with same id
        let userToFollow = await User.findById(req.query.id);

        //Finding logged-in user details
        let loggedInUser = await User.findById(req.user);

        //if user not found
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "Invalid Id provided.",
            });
        }
        //If user Found
        //Checking if userToFollow id is already exists in logged-in users following array
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexOfFollowing = loggedInUser.following.indexOf(userToFollow._id);
            const indexOfFollower = userToFollow.followers.indexOf(loggedInUser._id);

            //If they already follow each others

            //Removing their id from following and following fields

            loggedInUser.following.splice(indexOfFollowing, 1);
            userToFollow.followers.splice(indexOfFollower, 1);

            //Saving the user document

            await userToFollow.save();
            await loggedInUser.save();

            //Sending the responce
            console.log("finished");
            res.status(200).json({
                success: true,
                message: "User Unfollowed.",
            });
        } else {
            //Adding user id in crossponded fields

            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            //Saving the user documents

            await loggedInUser.save();
            await userToFollow.save();

            //Sending the responce

            res.status(200).json({
                success: true,
                message: "User Followed.",
            });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};

//Password Update Function

exports.updateUserPasswordFunction = async (req, res) => {
    try {
        //Getting old and new password from body.

        const {oldpassword, newpassword} = req.body;
        //If in case of user didn't provide details in body.
        if (!oldpassword && !newpassword) {
            return res.status(423).json({
                success: false,
                message: "Please provide old nad new password.",
            });
        }

        //Finding user by id
        let user = await User.findById(req.user).select("password");
        //Matching old password
        const isPasswordMatched = await user.matchPassword(oldpassword);
        // if password not matched
        if (!isPasswordMatched) {
            return res.status(423).json({
                success: false,
                message: "Incorrect Old password.",
            });
        }
        //If password matched

        user.password = newpassword;
        await user.save();

        //Sending the response

        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};

//Profile Update Function

exports.updateProfileFunction = async (req, res) => {
    try {
        const {about, username, fullname, email} = req.body;
        let user = await User.findById(req.user);
        //updating user details
        if (about) {
            user.about = about;
        }
        if (username) {
            user.username = username;
        }
        if (fullname) {
            user.fullName = fullname;
        }
        if (email) {
            user.email = email;
        }
        //saving user details
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated.",
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};

//Forgot password function

exports.forgotPasswordFunction = async (req, res) => {
    try {
        const {email} = req.body;
        //searching user by given email
        let user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user found.",
            });
        }

        //generating resetPasswordToken
        const resetToken = user.generateResetToken();
        //saving user docs
        await user.save();

        //Creating reset url

        const resetUrl = `${req.protocol}://${req.get(
            "host"
        )}/user/password/reset/${resetToken}`;

        let message = ` <h1>Email reset link</h1> <br/><p>You can reset your password by  clicking on this link ${resetUrl}</p>`;

        try {
            let transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            //defining mail options

            const mailOptions = {
                from: process.env.MAIN_EMAIL,
                to: user.email,
                subject: "PASSWORD RESET MESSAGE",
                text: message,
            };
            //final mail sending function.
            await transporter.sendMail(mailOptions, (err, res) => {
                if (err) {
                    return res.send(err);
                }
            });

            // send email function is implement here

            res.status(200).json({
                success: true,
                message: "Email to your email address.",
                details: message,
            });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//reset password function

//need to be improved
exports.resetPasswordFunction = async (req, res) => {
    try {
        const {password} = req.body;
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");
        /*error*/
        let user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()},
        });
        if (user) {
            //Resetting the password
            user.password = password;
            //removing token and token expire time
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            //final response

            return res.status(200).json({
                success: true,
                message: "Password reset Successfully.",
            });
        } else {
            return res.status(422).json({
                success: false,
                message: "Token is invalid or expired.",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//find user by id
exports.findUserProfile = async (req, res) => {
    try {
        //Searching user by id form query

        const {id} = req.query;
        //At least id is in query
        if (id) {
            let user = await User.findById(req.query.id).populate(
                "followers following posts "
            );
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "No user Found.",
                });
            }
            //increasing profile view count by 1 for each request
            user.profile_views = user.profile_views + 1;
            //saving the user doc
            await user.save();

            //Sending final response
            res.status(200).json({
                success: true,
                details: user,
                message: "Details fetched successfully.",
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//find user by fuzzy text search
exports.findUserByName = async (req, res) => {
    try {
        //search user in database by using regex search
        const users = await User.find({
            fullName: {$regex: req.query.name, $options: "i"},
        }).populate("followers following posts");

        //Sending users details
        res.status(200).json({
            success: true,
            details: users,
            message: "Details fetched successfully.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//Delete user account function

exports.deleteUserFunction = async (req, res) => {
    try {
        //Stroring all data into variables
        let user = await User.findById(req.user);
        let posts = user.posts;
        let followers = user.followers;
        let following = user.following;
        let user_id = user._id;

        //logging out user
        res.clearCookie("token");

        //Deleting all posts of the user if exists
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        //Removing user from followers following
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);

            //Finding the index
            const index = follower.following.indexOf(followers[user_id]);
            follower.following.splice(index, 1);
            await follower.save();
        }

        //Removing user from followings followers

        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);

            //finding index
            const index = follows.followers.indexOf(user_id);
            follows.followers.splice(index, 1);
            await follows.save();
        }

        // removing all comments of the user from all posts
        const allPosts = await Post.find();

        for (let i = 0; i < allPosts.length; i++) {
            const post = await Post.findById(allPosts[i]._id);

            for (let j = 0; j < post.comments.length; j++) {
                if (post.comments[j].user === userId) {
                    post.comments.splice(j, 1);
                }
            }
            await post.save();
        }
        // removing all likes of the user from all posts

        for (let i = 0; i < allPosts.length; i++) {
            const post = await Post.findById(allPosts[i]._id);

            for (let j = 0; j < post.likes.length; j++) {
                if (post.likes[j] === userId) {
                    post.likes.splice(j, 1);
                }
            }
            await post.save();
        }

        res.status(200).json({
            success: true,
            message: "Profile Deleted",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

//Fetching all user

exports.getAllUserFunction = async (req, res) => {
    try {
        let users = await User.find().populate("followers following posts");
        res.status(200).json({
            success: true,
            details: users,
            message: "Details fetched successfully.",
        });
    } catch (e) {
        res.status(e.status).json({
            success: false,
            message: e.message,
        });
    }
};

//Get all  posts of logged in user

exports.getmyPosts = async (req, res) => {
    try {
        const posts = await Post.find({owner: req.user}).populate(
            "owner likes comments"
        );
        res.status(200).json({
            success: true,
            posts,
            message: "Posts fetched successfully.",
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};
