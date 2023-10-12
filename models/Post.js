const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  description: String,

  image: {
    public_id: String,
    public_url: String,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  share:{
    type:Number,
    default:0
  },
  views:{
    type:Number,
    default:0
  }
},{timestamps:true});

module.exports = mongoose.model("Post", postSchema);
