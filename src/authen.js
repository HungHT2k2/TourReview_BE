import jwt from 'jsonwebtoken'
import { config } from "dotenv";
import FacebookStrategy from 'passport-facebook';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../src/models/userModel.js'
config();
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from process.env;

// function generateAccessToken(username, check) {
//   // tạo access token key = header + payload + secretkey
//   const token = jwt.sign(username, process.env.ACCESS_KEY, { expiresIn: '100 days' });
//   if (check != 2) {
//     return token;
//   }
//   const refreshToken = jwt.sign(username, process.env.REFRESH_KEY,
//     { expiresIn: '200 days' }
//   );

//   return { token: token, refreshToken: refreshToken };
//   // return jwt.sign(username, process.env.ACCESS_KEY, { expiresIn: '100 days' });
// };

function authenticateToken(req, res, next) {
  console.log("day là req");
  console.log(req);
  // url: '/user/token',
  if (req.url = "/user" || req.url == "/user/login" || req.url == '/user/register' || req.url == '/user/forgot-password' || req.url == '/user/register/google') {
    next();
  }

  else {

    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
      console.log(err)

      if (err) return res.status(200).json({
        data: {
          success: false,
          data: "Unauthorized access"

        }
      });
      req.user = user
      next()
    })
  }
}
const googleAuthen = new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/user/register/google', // Đường dẫn callback sau khi xác thực thành công
},
  async (accessToken, refreshToken, profile, cb) => {
    try {
      const provider = profile.provider;
      const id = profile.id;
      const cred = await User.findOne({ provider: provider, google_id: id });

      if (!cred) {
        const { id, displayName, emails, photo, provider } = profile;

        const body = {
          name: displayName,
          email: emails[0].value, // Assuming emails is an array
          google_id: id,
          role: "user",
          provider: provider,
          password: "password",
        }

        try {
          const user = await User.create(body)
          const data = { success: true, user: user, token: accessToken }
          return cb(null, data)
        } catch (error) {
          return cb(error)
        }
      }

      const data2 = { success: true, user: cred, token: accessToken }
      return cb(null, data2);

    } catch (error) {
      return cb(error);
    }
  }

)




export { generateAccessToken, authenticateToken, googleAuthen };