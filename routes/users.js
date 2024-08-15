const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    // post route
    .post(catchAsync(users.register));


router.route('/login')
    .get(users.renderLogin)
    .post(
        // Use storeReturnTo middleware to save returnTo value from session to res.locals
        storeReturnTo, 
        // passport.authenticate logs in the user and clears req.session
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), 

        // now can use res.locals.returnTo to redirect the user after logging in
        users.login
    )

router.route('/logout').get(users.logout)


module.exports = router;