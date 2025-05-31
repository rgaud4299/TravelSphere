const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner } = require("../middleware.js")
const multer = require('multer')
const { storage } = require("../cloudConfig.js");
const { equal } = require("joi");
const upload = multer({ storage })

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

// index/home route 
router.get("/", wrapAsync(async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listing/index.ejs", { allListing });
}))

// new route
router.get("/new", isLoggedIn, (req, res) => {

  res.render("listing/new.ejs");
})

//create Listing route 
router.post("/", validateListing,  wrapAsync(async (req, res, next) => {
  // let results = listingSchema.validate(req.body);
  let url = req.file.path;
  let filename = req.file.filename

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id
  newListing.image = { url, filename }
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listing");
}));



// show Listing route
router.get("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({path:"reviews",populate:{path:"author"}})
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listing")
  }
  // console.log(listing);
  
  res.render("listing/show.ejs", { listing })
}))

//   edit Listing
router.get("/:id/edit", isLoggedIn, isOwner,wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listing")
  }
  let originalImage= listing.image.url;
   originalImage= originalImage.replace("/upload","/upload/h_300,w_2560")
  res.render("listing/edit.ejs", { listing,originalImage });
}));

// update
router.put("/:id", isLoggedIn,isOwner,upload.single('listing[image]'), validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
let listing=await Listing.findById(id);


  if(typeof req.file!=="undefined"){

  let url = req.file.path;
  let filename = req.file.filename
  listing.image={url,filename}
  await listing.save();
  }
await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", " Listing Update!")
  res.redirect(`/listing/${id}`);
}));


// delete route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing, "this post is deleted");
  req.flash("success", "Listing Deleted!")
  res.redirect(`/listing`);
}))


module.exports = router;
