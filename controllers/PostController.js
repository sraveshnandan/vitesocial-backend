const Post = require("../models/Post");
const User = require("../models/User");

//creating new post function
exports.createPostFunction = async (req, res) => {
    try {

        //getting new post data from body
        const {description} = req.body;
        //finding user by id
        let user = await User.findById(req.user);
        //creating new post
        let post = await Post.create({
            description, image: {public_id: "test id", public_url: "test url"}, owner: req.user

        });
        //adding newly created post id in owners posts array
        user.posts.unshift(post._id);
        //saving user doc
        await user.save();

        //final responce
        res.status(201).json({
            success: true, details: post, message: "Post created."
        })


    } catch (e) {
        res.status(500).json({
            success: false, message: e.message
        })

    }
};

//deleting post function

exports.deletePostFunction = async (req, res) => {
    try {
        const {id} = req.params;
        //Searching post by id
        let post = await Post.findById(id);
        //if no post found
        if (!post) {
            return res.status(404).json({
                success: false, message: "No post found."
            })

        }

        //if post found

        //checking if logged-in user is the owner of the post
        if (post.owner.toString() != req.user.toString()) {
            return res.status(401).json({
                success: false, message: "Unauthorised."
            })
        }
        //if logged-in user is the owner of the post
        //removing post
        await post.deleteOne();
        //finding the user
        let user = await User.findById(req.user);

        //finding index of the post id

        const index = user.posts.indexOf(id);
        //removind post id
        user.posts.splice(index, 1);
        //saving user
        await user.save();

        //Final response
        res.status(200).json({
            success: true, message: "Post deleted."
        })


    } catch (e) {
        res.status(500).json({
            success: false, message: e.message
        })

    }
};

//Like and Unlike post

exports.likeOrUnlikePostFunction = async (req, res) => {
    try {
        const {id} = req.params;
        //searching the post
        let post = await Post.findById(id);
        //if no post found
        if (!post) {
            return res.status(404).json({
                success: false, message: "No post Found."
            })
        }
        ;

        if (post.likes.includes(req.user)) {
            const index = post.likes.indexOf(req.user);
            post.likes.splice(index, 1);
            await post.save();

            return res.status(200).json({
                success: true, message: "Post Unliked."
            })
        } else {
            post.likes.unshift(req.user);
            post.views = post.views + 1;
            await post.save();

            return res.status(200).json({
                success: true, message: "Post Liked."
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false, message: err.message
        })
    }
};

//Get posts of followed users
exports.getFollowingUsersPostsFunction = async (req, res) => {
    try {
        let user = await User.findById(req.user);
        //Finding followings posts from database

        let posts = await Post.find({
            owner: {$in: user.following},
        }).populate("owner likes comments");

        //final response

        //If there is no post found

        if (posts.length === 0) {
            return res.status(200).json({
                success: true, message: "No posts yet."
            })
        }
        const data = posts.reverse();
        res.status(200).json({
            success: true,
            count: data.length,
            data,

            message: "Details fetched successfully."
        })


    } catch (e) {
        res.status(500).json({
            success: false, message: e.message
        })

    }
};

//Get all posts

exports.getAllPostsFunction = async (req, res) => {
    try {
        const posts = await Post.find().populate("owner likes comments");
        //if there is no post in database
        if (posts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No post yet."
            })
        }


        //otherwise
        res.status(200).json({
            success: true,
            data: posts,
            message: "Data fetched successfully."
        })

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })

    }
};

//update post description

exports.updatePostCaption = async (req, res) => {
    try {
        //searching the requested post
        let post = await Post.findById(req.params.id);
        //if post not found
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Invalid Post id."
            })
        }
        //checking if logged-in user is the owner of the post
        if (post.owner.toString() != req.user.toString()) {
            return res.status(422).json({
                success: false,
                message: "Unauthorised access."
            })
        }
        ;
        //updating post details

        post.description = req.body.description;
        //saving post
        await post.save();
        //final response
        res.status(200).json({
            success: true,
            message: "Post description updated."
        })


    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })

    }
};

//comment on post function

exports.commentOnPostFunction = async (req, res) => {
    try {
        //searching the post
        let post = await Post.findById(req.params.id);
        //if post not found
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Invalid Post id."
            })
        }

        let commentIndex = -1;
        //checking if comment already exists
        post.comments.forEach((items, index)=>{
            if (items.user.toString() === req.user.toString()){
                commentIndex = index;
            }

        });
        //if comment is already exists

        if (commentIndex !== -1){
            post.comments[commentIndex].comment = req.body.comment;
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Comment updated."
            })
        }else {
            //if comment is no exists
            post.comments.push({
                user: req.user,
                comment:req.body.comment
            });
            await post.save();
            return res.status(200).json({
                success:true,
                message:"Comments added."
            })
        }

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        })

    }
};

//delete comments function

exports.deleteCommentFunction = async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        console.log(post)

    //if post not found
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Checking If owner wants to delete

        if (post.owner.toString() === req.user._id.toString()) {
            if (req.query.c_id === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Comment Id is required",
                });
            }

            post.comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1);
                }
            });
            await post.save();

            return res.status(200).json({
                success: true,
                message: "Selected Comment has deleted",
            });
        }else {
            post.comments.forEach((item, index) => {
                if (item.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1);
                }
            });

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Your Comment has deleted",
            });
        }

    }catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });

    }
}
