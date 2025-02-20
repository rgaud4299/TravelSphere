const express = require("express");
const { model } = require("mongoose");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {

    res.render("users/signup.ejs")
})

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password)
        console.log(registerUser);
        req.login(registerUser, ((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", 'you are logged in! ')
             res.redirect("/listing")
        }))
        

    }
    catch (e) {
        req.flash("error", e.message)
        res.redirect("/signUp")
    }
}))

// login
router.get("/login", async (req, res) => {
   
    
    res.render("users/login.ejs")
})


router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome to Online Booking")
    res.redirect(res.locals.redirectUrl|| "/listing");
});

router.get("/logout", (req, res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", 'you are logged out! ')
        res.redirect("/listing")
    })
})
module.exports = router;