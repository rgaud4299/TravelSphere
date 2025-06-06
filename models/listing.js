
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const Review=require("./review.js")

// const listingSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   }, 
//   description: String,
//   image: {
//     url: String,
//    filename:String
//   },
//   price: Number,
//   location: String,
//   country: String,
//   reviews:[
//     {
//       type:Schema.Types.ObjectId,
//       ref:"Review"
//     }
//   ],
  
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', 
// },
// });
//   // delete review 
// listingSchema.post("findOneAndDelete",async(listing)=>{
// if(listing){
//   await Review.deleteMany({_id:{$in: listing.reviews}})
// }
// });
// const Listing = mongoose.model("Listing", listingSchema);
// module.exports = Listing;


const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: String,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    contactNumber: { // Added contact number property
        type: String,
        // You can adjust this to false if contact number is optional
    },
});

// delete review
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
