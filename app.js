if(process.env.NODE_ENV !="production"){
  require('dotenv').config()
}

// console.log(process.env);



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/myDataBase";
const path = require("path");
const methodOverride = require("method-override");
const engine = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")
const dburl=process.env.AtlasDB_url
const session = require("express-session");
const MongoStore= require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require('passport-local').Strategy;

const User = require("./models/user.js");
const { log } = require('console');

const store=MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret:process.env.secret
  },
  touchAfter:24*3600,
})


store.on("error",()=>{
  console.log("error in mongo session store ",err);
  
})


const sessionOptions = {
  store,
  secret:process.env.secret,
  resave: false,
  saveUninitialized: false,
  cookies: {
    expires: Date.now() + 7 * 24 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}



app.set("view engine", "ejs");
app.engine('ejs', engine);
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")))
 

app.use(session(sessionOptions))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
})
app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "mca-student"
  })
  let registerUser = await User.register(fakeUser, "helloworld")
  res.send(registerUser)
})

app.use("/listing", listingRouter)
app.use("/listing/:id/reviews", reviewRouter)
app.use("/", userRouter);
app.use("", listingRouter)

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}



app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"))
});


// app.use((err, req, res, next) => {
//   let { statusCode = 500, message = "wrong Something" } = err;
//   res.status(statusCode).render("error.ejs", { message });
//   // res.status(statusCode).send(message)
// })

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err || "Something went wrong";

  // Error को console में log करें ताकि आप terminal में देख सकें
  console.error("🔥 Error:", err);

  // Error को JSON format में भेजें ताकि सबकुछ साफ़ दिखाई दे
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: err.stack  // यह बताएगा error कहां से आया
  });
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");

})
