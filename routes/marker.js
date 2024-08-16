const express = require('express');
const router = express.Router();
const markers = require('../controllers/markers');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateMarker } = require('../middleware');

// middleware for uploading files
// parse the form, a new object file
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Markers = require('../models/markers');

router.route('/')
    .get(catchAsync(markers.index))
    // upload.array: multiple image
    .post(isLoggedIn, upload.array('image'), validateMarker, catchAsync(markers.creatMarker))
    // .post(upload.array('image'), (req,res) => {
    //     console.log({body: req.body, file: req.files});
    //     res.send("worked!");
    // })

router.get('/new', isLoggedIn, markers.renderNewForm)

router.route('/:id')
    .get(catchAsync(markers.showMarker))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateMarker, catchAsync(markers.updateMarker))
    .delete(isLoggedIn, isAuthor, catchAsync(markers.deleteMarker));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(markers.renderEditForm))



module.exports = router;