const  mongoose =require( "mongoose");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//Defining user schema

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username already exists."],
        required: [true, "username is required."]
    },
    fullName: {
        type: String,
        required: [true, "fullName is required."]
    },
    avatar: {
        public_url: String,
        public_id: String
    },
    email: {
        type: String,
        required: [true, "email is required."],
        unique: [true, "email already exists."]
    },
    password: {
        type: String,
        required: [true, "password can't be empty"],
        minLength: [6, "password must be at least six characters long."],
        select: false
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    user_type:{
        type:String,
        enum:["admin", "user"],
        default:"user"

    },
    about:String,
    profile_views:{
        type:Number,
        default: 0
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpire:{
        type:Date
    }



},{timestamps:true});

//Hashing user's password before storing into database

UserSchema.pre("save", async  function(next){
    if(this.isModified("password")){
        this.password = await  bcrypt.hash(this.password, 10);

    }
    next();
});

//Matching the user's password
UserSchema.methods.matchPassword = async function(password){
    return await  bcrypt.compare(password, this.password);
}

//Generating auth token for loged in user

UserSchema.methods.generateAuthToken =  function(id){
    return jwt.sign({_id:id},process.env.JWT_SECRET, {expiresIn: "1d"});
}




//Generating reset password token

UserSchema.methods.generateResetToken = function (){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

module.exports= new mongoose.model("User", UserSchema);