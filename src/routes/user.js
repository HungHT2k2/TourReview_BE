import express from "express";
import passport from 'passport'
import userController from "../controllers/userController.js";
import middlewareController from "../controllers/middlewareController.js";
const userRouter = express.Router();
import UserController from '../controllers/userController.js'

userRouter.get('/top_reviewer', UserController.getTopReviewer);

userRouter.get('/', UserController.getAll);
userRouter.post('/find', UserController.findUserByEmail);

userRouter.get('/:id', UserController.getUserID);
userRouter.post('/forgot-password', UserController.forgotPassword);
userRouter.post('/register', UserController.postUser);
userRouter.post('/login', UserController.CreateToken);
userRouter.post('/refreshToken', UserController.RefreshToken)
userRouter.delete('/', UserController.deleteUser);
userRouter.put('/:id', UserController.updateUser);
userRouter.put('/block/:id', UserController.blockUser);
userRouter.put('/open/:id', UserController.openUser);


userRouter.get('/profile/:id', middlewareController.verifyToken, userController.getUserDetail);
userRouter.post('/update/:id', middlewareController.verifyToken, userController.updateUserDetails);
userRouter.post('/f_m/:id', middlewareController.verifyToken, userController.userReviewerFollow);
userRouter.post('/c_m/:id', middlewareController.verifyToken, userController.userTourFollow);


export default userRouter;