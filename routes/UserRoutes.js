const {
    loginUserFunction,
    registerUserFunction,
    getUserProfileFunction,
    logOutUserFunction,
    FollowOrUnfollowUserFunction,
    updateUserPasswordFunction,
    updateProfileFunction,
    findUserProfile,
    findUserByName,
    forgotPasswordFunction,
    resetPasswordFunction,
    deleteUserFunction
} = require("../controllers/UserController");
const {isLoggedIn} = require("../middlewares/Auth");
const router = require("express").Router();

//general Routes
router.route("/user/register").post(registerUserFunction);

router.route("/user/login").post(loginUserFunction);

router.route("/user/logout").get(isLoggedIn, logOutUserFunction);

router.route("/user/profile").get(isLoggedIn, getUserProfileFunction).delete(isLoggedIn, deleteUserFunction);

router.route("/user").get(isLoggedIn, FollowOrUnfollowUserFunction);

router.route("/user/updatePassword").put(isLoggedIn, updateUserPasswordFunction);

router.route("/user/updateProfile").put(isLoggedIn, updateProfileFunction);

router.route("/user/find").get(isLoggedIn, findUserProfile);

router.route("/users").get(isLoggedIn, findUserByName);

router.route("/user/forgotPassword").post(forgotPasswordFunction);

router.route("/user/password/reset/:token").put(resetPasswordFunction);

module.exports = router;