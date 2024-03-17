import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'reviewer'],
        default: 'user'
    },
    google_id: {
        type: Number
    },
    facebook_id: {
        type: Number
    },
    provider: {
        type: String
    },
    ownerTours: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: "tours"
            },
        ],
        default: []
    },
    favoriteTours: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: "tours"
            },
        ],
        default: []
    },
    followings: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: "users"
            },
        ],
        default: []
    },
    followers: {
        type: [
            {
                type: mongoose.Types.ObjectId,
                ref: "users"
            },
        ],
        default: []
    },
    status: {
        type: String,
        enum: [
            "locked",
            "pending",
            "opened"
        ],
        default: "opened"
    },
    tags: {
        type: [{
            k: String,
            v: String
        }],
        default: []
    }
}, {
    timestamps: true,
})
export default mongoose.model("users", userModel);