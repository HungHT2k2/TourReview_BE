
import jwt from 'jsonwebtoken'
import { config } from "dotenv";
import userModel from "../models/userModel.js";
import { generateAccessToken, googleAuthen } from "../authen.js";
import passport from 'passport'
import tourModel from "../models/tourModel.js";
import cookieParser from "cookie-parser";

class TourController {

    findAll = async (req, res, next) => {
        try {
            const userModels = await userModel.find({});

            return userModels;
        } catch (err) {
            return err;
        }

    }

    findOne = async (req, res, next) => {
        const { id } = req.params;
        if (!id) {
            return next();
        }
        try {

            const userModel = await userModel.find(req.query)
            return userModel;
        } catch (err) {
            return err;
        }
    }

    Update = async (req, res, next) => {
        const { id } = req.params;
        try {

            const userUpdate = await userModel.findById(id).exec();
            if (!userUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "User not found"
                    }
                };
            }
            await userModel.findOneAndUpdate({ _id: id }, req.body);
            return {
                data: {
                    statusCode: 200,
                    success: true,
                }
            };
        } catch (err) {
            return err;
        }
    }

    blockUser = async (req, res, next) => {
        const { id } = req.params;
        try {

            const userUpdate = await userModel.findById(id).exec();
            if (!userUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "User not found"
                    }
                };
            }
            await userModel.findOneAndUpdate({ _id: id }, { status: "locked" });
            await tourModel.updateMany({ owner: id }, { status: "inactive" })
            return {
                data: {
                    statusCode: 200,
                    success: true,
                }
            };
        } catch (err) {
            return err;
        }
    }
    openUser = async (req, res, next) => {
        const { id } = req.params;
        try {

            const userUpdate = await userModel.findById(id).exec();
            if (!userUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "User not found"
                    }
                };
            }
            await userModel.findOneAndUpdate({ _id: id }, { status: "opened" });
            await tourModel.updateMany({ owner: id }, { status: "opened" })
            return {
                data: {
                    statusCode: 200,
                    success: true,
                }
            };
        } catch (err) {
            return err;
        }
    }


    Create = async (req, res, next) => {

        const { email } = req.body;

        try {

            const user = await userModel.findOne({ email: email }).exec();

            if (user) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        data: "Email is not the same the other user"
                    }
                };
            }

            const userModelFind = await userModel.create(req.body)
            const { token, refreshToken } = generateAccessToken({ _id: userModelFind['_id'], role: userModelFind["role"] }, 2);

            const cookieRefresh = await cookieParser.signedCookie(refreshToken, process.env.REFRESH_KEY)
            res.cookie('refresh', cookieRefresh);
            // const cookieValue = req.cookies['refresh'];

            return {
                data: {
                    statusCode: 200,
                    success: true,
                    data: userModelFind,
                    token: token,

                }
            };


        } catch (error) {
            return error;
        }
    }

    Login = async (req, res, next) => {
        // const check = { $or: [{ status: "pending" }, { status: "opened" }] };
        try {
            const userModelFind = await userModel.findOne({ ...req.body }, { password: 0 }).exec();
            if (!userModelFind) {
                
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        data: "Kiểm tra lại tên hoặc mật khẩu"
                    }
                };
            };
            if (userModelFind['status'] == 'locked') {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        data: "Bạn đã bị blocked."
                    }
                };
            }

            const { token, refreshToken } = await generateAccessToken({ _id: userModelFind['_id'], role: userModelFind["role"] }, 2);
            const result = {
                data: {
                    statusCode: 200,
                    success: true,
                    data: userModelFind,
                    token: token,
                    refreshToken: refreshToken
                }
            };
            const cookieRefresh = await cookieParser.signedCookie(refreshToken, process.env.REFRESH_KEY)
            res.cookie('refresh', cookieRefresh);
            // const cookieValue = req.cookies['refresh'];
            return result;
        } catch (err) {
            return err;
        }

    }

    Refresh = async (req, res, next) => {
        const { refreshToken } = req.body;
        // Kiểm tra Refresh token có được gửi kèm và mã này có tồn tại trên hệ thống hay không
        const cookieValue = req.cookies['refresh'];
        let token;
        if ((refreshToken) && (refreshToken == cookieValue)) {
            // Kiểm tra mã Refresh token
            jwt.verify(cookieValue, process.env.REFRESH_KEY, (err, user) => {
                if (err) {

                    return res.status(400).json({
                        statusCode: 400,
                        success: false,
                        data: "Invalid Refresh Token"

                    });
                }
                // Tạo mới mã token và trả lại cho user
                token = generateAccessToken({ _id: user['_id'], role: user["role"] }, 1);

                return res.status(400).json(
                    {
                        statusCode: 200,
                        success: true,
                        token: token,
                    }
                )
            })
        } else {

            return {
                data: {
                    statusCode: 400,
                    success: false,
                    data: "Invalid Request"
                }
            }
        }
    }
    getTopReviewer = async (req, res, next) => {
        try {
            const topReviewer = await userModel.aggregate([
                { $match : { role: 'reviewer'} },
                { $addFields : { 
                    followers_size :{
                        $size :{
                            $ifNull:[
                                "$followers",[]
                            ]
                        },
                        
                },
                tour_size :{
                    $size :{
                        $ifNull:[
                            "$ownerTours",[]
                        ]
                    },
                    
                 }}},
                { $sort: { followers_size : -1} },
                { $limit : 9}
            ])
            return topReviewer;
            
        } catch (error) {
            return err;
        }
        
    }


}

export default new TourController;