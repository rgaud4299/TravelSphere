const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const review = require("../models/review.js");
const { isLoggedIn } = require("../middleware.js");

const validateReview = (req, res, next) => {
  // console.log(reviewSchema.validate(req.body))
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",")
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

// reviw post routes

router.post("/",isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author=req.user._id;
  listing.reviews.push(newReview);

  
    
     
     
     
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review is Created!")
  res.redirect(`/listing/${listing._id}`)

}))

// review delete 
router.delete("/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId)
  req.flash("success", "Review is Deleted!")
  res.redirect(`/listing/${id}`);
}))

module.exports = router;
