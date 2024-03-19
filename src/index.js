import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import router from "./routes/index.js";
import bodyParser from 'body-parser';
import { connect } from "mongoose";
import { authenticateToken, facebookAuthen, googleAuthen } from './authen.js'
import passport from 'passport'
import cookieParser from 'cookie-parser';
import session from 'express-session'
import { Server } from "socket.io";
import http from "http";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import Strategy from 'passport-google-oauth2'
const { KEY_SESSION } = process.env;
const OAuth2Strategy = Strategy.Strategy;
import userGG from './models/userLogGG.js';
const app = express();
import axios from 'axios';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const server = http.createServer(app);
const clientid = "456366005687-8h5hia88l2cpbne7k9l9sdg1nomhe2ar.apps.googleusercontent.com"
const clientsecret = "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"
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
export { io };

config();
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000"
  })
);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  secret:"YOUR SECRET KEY",
  resave:false,
  saveUninitialized:true
}))

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new OAuth2Strategy({
      clientID:clientid,
      clientSecret:clientsecret,
      callbackURL:"/auth/google/callback",
      scope:["profile","email"]
  },
  async(accessToken,refreshToken,profile,done)=>{
      try {
          let user = await userGG.findOne({googleId:profile.id});

          if(!user){
              user = new userGG({
                  googleId:profile.id,
                  displayName:profile.displayName,
                  email:profile.emails[0].value,
                  image:profile.photos[0].value
              });
              await user.save();
          }
          return done(null,user)
      } catch (error) {
          return done(error,null)
      }
  }
  )
)

passport.serializeUser((user,done)=>{
  done(null,user);
})

passport.deserializeUser((user,done)=>{
  done(null,user);
});

// initial google ouath login
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "http://localhost:3000/login"
}), function(req, res) {
  // Thực hiện các hành động bạn muốn sau khi xác thực thành công
  console.log("Authentication successful!");
  console.log("Authenticated user:", req.user);
  
  // Gọi API khác sau khi xác thực thành công
  const body = {
    name: req.user.displayName,
    email: req.user.email,
    password:"skadnaksdnidewi3313912mkdskskdmksda",
}
  
  axios.post('http://localhost:9999/user/register', body)
  .then(function (response) {
    console.log("API call successful!");
    // Tiếp tục với chuyển hướng sau khi xác thực thành công và gọi API thành công
    res.redirect("http://localhost:3000/");
  })
  .catch(function (error) {
    console.error("API call failed:", error);
    // Xử lý lỗi API nếu cần
    // Sau đó, tiếp tục với chuyển hướng sau khi xác thực thành công, dù gọi API thất bại
    res.redirect("http://localhost:3000/");
  });
});
app.get("/login/sucess",async(req,res)=>{

  if(req.user){
      res.status(200).json({message:"user Login",user:req.user})
  }else{
      res.status(400).json({message:"Not Authorized"})
  }
})
// app.use(session({
//   secret: KEY_SESSION,
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     maxAge: 100 * 60 * 1000 // 10s
//   },
// }))
// app.use(cookieParser())

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(googleAuthen);
// passport.use(facebookAuthen)
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   // console.log('deserial');
//   done(null, obj);
// });

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

// app.get('/user/register/google',
//   passport.authenticate('google', {
//     failureRedirect: (req, res, next) => {
//       return res.status(200).json({
//         success: false,
//         statusCode: 400,
//         data: "error",
//       })
//     }
//   }),
//   (req, res) => {
//     // Successful authentication, redirect home.
//     console.log("req =================================================");
//     console.log(req.user);
//     const userData = {
//       success: true,
//       statusCode: 200,
//       data: encodeURIComponent(JSON.stringify(req.user))
//     };
//     const queryString = (Object.keys(userData).map(key => `${key}=${userData[key]}`).join('&'));
//     res.redirect(`http://localhost:3000?${queryString}`);
//   }
// );


// app.get('/login/facebook', (req, res, next) => { console.log(0); next() }, passport.authenticate('facebook'));


// app.get('/auth/facebook/callback', (req, res, next) => { console.log("callback"); next() },
//   passport.authenticate('facebook', {
//     failureRedirect: (req, res, next) => {
//       res.redirect('http://localhost:3000/')
//       return res.status(200).json({
//         success: false,
//         statusCode: 400,
//         data: "error",
//       })
//     }
//   }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     console.log("req =================================================");
//     console.log(req.user);
//     const userData = {
//       success: true,
//       statusCode: 200,
//       data: encodeURIComponent(JSON.stringify(req.user))
//     };

//     const queryString = (Object.keys(userData).map(key => `${key}=${userData[key]}`).join('&'));
//     res.redirect(`http://localhost:3000?${queryString}`);
//   });

// //==========


connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
})
  .then((res) => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(`your error :${err}`);
  });
const PORT = process.env.PORT || 5000;

router(app);
server.listen(PORT, () => {
  console.log(`connect to port : ${PORT}`);
})
