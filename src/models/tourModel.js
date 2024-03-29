import mongoose from "mongoose";

const tourModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    introduction: {
        type: String,
    },
    tours: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    rating: {
        type: [
            {
                id: {
                    type: mongoose.Types.ObjectId,
                    ref: "users"
                },
                star: {
                    type: Number,
                    default: 0
                }
            }
        ],
        default: []
    },
    favorites: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: "users"
            }
        ],
        default: []
    },
    tags: {
        type: [],
        default: []
    },
    status:{
        type:String,
        enum:["pending",'active','inactive'],
        default:"active"
    }

}, {
    timestamps: true
})

export default mongoose.model('tours', tourModel);