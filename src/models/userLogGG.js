import mongoose from "mongoose";

const userLogGG = new mongoose.Schema({
    googleId:String,
    displayName:String,
    email:String,
    image:String
},{timestamps:true});


export default mongoose.model("userGG", userLogGG);
