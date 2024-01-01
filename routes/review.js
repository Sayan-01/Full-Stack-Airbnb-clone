const express = require("express");
const router = express.Router({mergeParams: true}); //router object
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLogin, isReviewAuthor } = require("../middleware/middleware.js");

//for adding review

router.post(
  "/",
  isLogin,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;      //akhin ekhane kono :id asbe na karon ,listing/:id/reviews app.js likhle , 
                                        //asa :id oi app.js file ai roy jay tai oi :id pass koranor jonnoilikhte 
                                        //hoyche "marge params" ta likhle perent rout a asa parameter k child ar 
                                        //sathe marge kore day
    let listing = await Listing.findById(id);
    let { rating, comment } = await req.body;
    let newReview = new Review({ rating, comment });
    newReview.author  = req.user._id
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "Review added!");
    res.redirect(`/listing/${id}`);
  })
);

//review delet

router.delete(
  "/:reviewId",
  isLogin,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull means deleting from array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review was deleted!")
    res.redirect(`/listing/${id}`);
  })
);

module.exports = router;