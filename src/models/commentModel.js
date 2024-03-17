import mongoose from "mongoose";

const commentModel = new mongoose.Schema({
    parentId:{
        type:mongoose.Types.ObjectId,
        ref:"comments"
    },
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"users"
    },
    content:{
        type:String,
        required:true
    },
    tourId:{
        type:mongoose.Types.ObjectId,
        ref:"tours"
    },
    replies:{
        type:[
            {
                type:mongoose.Types.ObjectId,
                ref:"comments"
            }
        ],
        default:[]
    },
    reported: {
        type: Boolean,
        default: false,
    }
},{
    timestamps:true
})

export default mongoose.model("comments", commentModel);