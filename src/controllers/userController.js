import UserService from '../repository/UserService.js'
import userModel from '../models/userModel.js'
import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import { response } from 'express';
import { generateAccessToken } from '../authen.js';
import nodemailer from 'nodemailer';
// import bcrypt from 'bcrypt';
class UserController {
    getAll = async (req, res, next) => {
        const user = await UserService.findAll(req, res, next);
        return res.send({
            status: 200,
            user
        })
    };
    getUserID = async (req, res, next) => {
        const user = await UserService.findOne(req, res, next);
        return res.send({
            status: 200,
            user
        })
    }

    forgotPassword = async (req, res, next) => {
        const { email } = req.body;
        console.log("change password", req.body);
        console.log("ss");
        try {
            const user = await User.findOne({ email: email });
            console.log(user);
            if (!user) {
                return res.send({ status: 400, data: "Not exist user" })
            }
            const token = generateAccessToken({ _id: user['_id'], role: user["role"] })
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'anhpthe161502@fpt.edu.vn',
                    pass: 'lncu wezr xpah qzdu'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log(token);

            var mailOptions = {
                from: 'anhpthe161502@fpt.edu.vn',
                to: email,
                subject: 'Reset Your password',
                html: `<h1>You click link below to change password</h1><a href="http://localhost:3000/change-password/${user['_id']}/${token}">Reset Password</a>`

            };

            transporter.sendMail(mailOptions, function (error, info) {
                console.log(info);
                console.log(error);
                if (error) {
                    // console.log("day là lỗi");
                    //   console.log(error);
                    return res.status(200).json({ success: false, data: "Can not change password" })
                } else {
                    console.log('Email sent: ' + info.response);
                    //   return res.send({status: 'success'});
                    const data = {
                        user: user,
                        token: token
                    }
                    return res.status(200).json({ success: true, data: data })
                }
            });


        } catch (error) {
            return res.status(400).json({ status: false, error: "Error Occurred" });
        }
    }
    postUser = async (req, res, next) => {


        const userCreate = await UserService.Create(req, res, next);
        if (!userCreate) {
            return res.status(400).send({
                status: "failed to create user",
            })
        }
        if (userCreate.data.statusCode !== 200) {
            return res.status(200).send({
                data: userCreate.data
            });
        }
        return res.status(200).send({
            data: userCreate.data
        });
    }
    deleteUser = async (req, res, next) => {
        await userModel.deleteOne(req.query);
        return res.status(200).json({
            status: "success",
        })
    }
    updateUser = async (req, res, next) => {

        try {
            const userUpdate = await UserService.Update(req, res, next);
            if (!userUpdate) {
                return res.status(400).json({
                    status: "failed to Update user",
                })
            }
            if (userUpdate.data.statusCode !== 201) {
                return res.status(200).json({
                    data: userUpdate.data
                });
            }
            return res.status(201).json({
                success: true,
            })
        } catch (error) {

        }

    }
    blockUser = async (req, res, next) => {

        try {
            const userUpdate = await UserService.blockUser(req, res, next);
            if (!userUpdate) {
                return res.status(400).json({
                    status: "failed to Update user",
                })
            }
            if (userUpdate.data.statusCode !== 201) {
                return res.status(200).json({
                    data: userUpdate.data
                });
            }
            return res.status(201).json({
                success: true,
            })
        } catch (error) {

        }

    }
    openUser = async (req, res, next) => {

        try {
            const userUpdate = await UserService.openUser(req, res, next);
            if (!userUpdate) {
                return res.status(400).json({
                    status: "failed to Update user",
                })
            }
            if (userUpdate.data.statusCode !== 201) {
                return res.status(200).json({
                    data: userUpdate.data
                });
            }
            return res.status(201).json({
                success: true,
            })
        } catch (error) {

        }

    }


    CreateToken = async (req, res, next) => {
        const user = await UserService.Login(req, res, next);
        if (user.data.statusCode !== 200) {
            return res.status(200).send({
                data: user.data
            });
        }
        return res.status(200).send({
            data: user.data
        })
    }

    RefreshToken = async (req, res, next) => {
        // try {
        return await UserService.Refresh(req, res, next);
    }
    async getUserDetail(req, res) {
        try {
            const { id } = req.params;
            const requestUser = await User.findById(req.user._id);
            let excluded = "-password";
            if (requestUser.role !== 'admin') {
                excluded += " -role";
            }
            const user = await User.findById(id).populate("ownerTours").populate("favoriteTours").populate({
                path: "followings",
                select: "_id name tags followers ownerTours"
            }).select(excluded);
            return res.status(200).json({
                user: {
                    ...user._doc,
                    your_following: requestUser?.followings,
                    owner: req.user._id == id
                }
            });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async updateUserDetails(req, res) {
        try {
            const { id } = req.params;
            const requestUser = await User.findById(req.user._id);
            if (!requestUser) {
                return res.status(404).json({ message: "User not found" });
            }
            if (requestUser.role === 'admin') {
                await User.findByIdAndUpdate(id, {
                    status: req.body.status,
                    role: req.body.role
                });
            }
            else {
                const data = { ...req.body };
                delete data.role;
                delete data.status;
                if (data.password) {
                    data.password = await bcrypt.hash(data.password, 12);
                }
                await User.findByIdAndUpdate(id, data);
            }
            return res.status(200).json({ message: "Update successfully" });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async userReviewerFollow(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(req.user._id);
            const follower = await User.findById(id);
            if (!user || !follower) {
                return res.status(404).json({ message: "User not found" });
            }
            const isAlreadyFollowing = user.followings.includes(id);
            if (isAlreadyFollowing) {
                await User.findByIdAndUpdate(req.user._id, {
                    $pull: { followings: id }
                });
                await User.findByIdAndUpdate(id, {
                    $pull: { followers: req.user._id }
                });
            } else {
                await User.findByIdAndUpdate(req.user._id, {
                    $addToSet: { followings: id }
                });
                await User.findByIdAndUpdate(id, {
                    $addToSet: { followers: req.user._id }
                });
            }
            const action = isAlreadyFollowing ? "Unfollow" : "Follow";
            return res.status(200).json({ msg: `${action} ${follower.name} successfully!` });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async userTourFollow(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(req.user._id);
            const tour = await Tour.findById(id);
            if (!user || !tour) {
                return res.status(404).json({ message: "User or tour not found" });
            }
            const isAlreadyFollowing = user.favoriteTours.includes(id);
            if (isAlreadyFollowing) {
                await User.findByIdAndUpdate(req.user._id, {
                    $pull: { favoriteTours: id }
                });
                await Tour.findByIdAndUpdate(id, {
                    $pull: { favorites: req.user._id }
                });
            } else {
                await User.findByIdAndUpdate(req.user._id, {
                    $addToSet: { favoriteTours: id }
                });
                await Tour.findByIdAndUpdate(id, {
                    $addToSet: { favorites: req.user._id }
                });
            }
            const action = isAlreadyFollowing ? "Unfollow" : "Follow";
            return res.status(200).json({ msg: `${action} successfully!` });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }
    getTopReviewer = async (req,res) => {
        try {
            const topReviewer= await UserService.getTopReviewer(req,req);
            return res.status(200).send({
                data: topReviewer,
                success:true
            });

        } catch (error) {
            return res.status(500).json({ message: error.toString() ,success:false});
        }
    }
}

export default new UserController;