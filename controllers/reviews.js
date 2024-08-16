// Controller: A component responsible for managing data flow and interaction logic, 
// between the model and the view

// for router/review.js

const Marker = require('../models/markers');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const marker = await Marker.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    marker.reviews.push(review);
    await review.save();
    await marker.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/markers/${marker._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Marker.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/markers/${id}`);
}