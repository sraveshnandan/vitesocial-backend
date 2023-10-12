const {isLoggedIn} = require("../middlewares/Auth");
const {
    createPostFunction,
    deletePostFunction,
    likeOrUnlikePostFunction,
    getFollowingUsersPostsFunction,
    getAllPostsFunction,
    updatePostCaption,
    commentOnPostFunction, deleteCommentFunction
} = require("../controllers/PostController");
const router = require("express").Router();

router.route("/post/create").post(isLoggedIn, createPostFunction);
router.route('/post/:id').delete(isLoggedIn, deletePostFunction).get(isLoggedIn, likeOrUnlikePostFunction).put(isLoggedIn, updatePostCaption).post(isLoggedIn, commentOnPostFunction);
router.route("/posts").get(isLoggedIn, getFollowingUsersPostsFunction);
router.route("/posts/all").get(isLoggedIn, getAllPostsFunction);
router.route("/post/comments/:id").get(isLoggedIn, deleteCommentFunction)

module.exports = router;