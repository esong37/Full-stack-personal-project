const { markerSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Marker = require('./models/markers.js');
const Review = require('./models/review');


// login middleware
module.exports.isLoggedIn = (req, res, next) => {
    // if not logged in , req.user is undefined
    if (!req.isAuthenticated()) {
        // Stores the returnTo value when a user attempts to access a page that requires authentication
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// Save returnTo value from session to res.markers
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.markers.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateMarker = (req, res, next) => {
    const { error } = markerSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// valid if this is the user
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const marker = await Marker.findById(id);
    if (!marker.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/markers/${id}`);
    }
    next();
}

// markers/:id/review/reviewId
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/markers/${id}`);
    }
    next();
}

// validate a marker and handel error
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}