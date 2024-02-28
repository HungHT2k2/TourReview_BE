import mongoose from "mongoose";

const commonModel = new mongoose.Schema({
    key: {
        type: String,
    },
    label:{
        type:String,
    },
    value:{
        type:String
    }
},{
    timestamps:true
})

export default mongoose.model("common", commonModel);