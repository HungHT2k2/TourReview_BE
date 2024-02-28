import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
class MiddlewareController {
    async verifyToken(req, res, next) {
        if (req.url.split('?')[1]) {

            const type = req.url.split('?')[1].split('=')[1];
            if (type == "google" || type == "facebook") {
                next();
            }

        }

        // if (req.url = "/user" || req.url == "/login/facebook" || req.url == "/auth/google" || req.url == "/user/login" || req.url == '/user/register' || req.url == '/user/forgot-password' || req.url == '/user/register/google') {
        //     next();
        // }

        try {
            const token = req.headers.authorization;
            if (token) {
                const accessToken = token.split(" ")[1];
                jwt.verify(accessToken, process.env.ACCESS_KEY, (err, user) => {
                    if (err) {
                        return res.status(400).json({ message: "Authentication failed" });
                    }
                    req.user = user;
                    next();
                });
            }
            else {
                return res.status(400).json({ message: "Authentication failed" });
            }
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async verifyAdmin(req, res, next) {
        try {
            const token = req.headers.authorization;
            if (token) {
                const accessToken = token.split(" ")[1];
                jwt.verify(accessToken, process.env.ACCESS_KEY, async (err, user) => {
                    if (err) {
                        return res.status(400).json({ message: "Authentication failed" });
                    }
                    const userDb = await User.findById(user._id);
                    if (userDb.role === 'admin') {
                        req.user = userDb;
                        return next();
                    }
                    else {
                        return res.status(400).json({ message: "Authentication failed" });
                    }
                });
            }
            else {
                return res.status(400).json({ message: "Authentication failed" });
            }
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }
}
export default new MiddlewareController;