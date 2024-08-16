// Controller: A component responsible for managing data flow and interaction logic, 
// between the model and the view

// for router/Markers.js
const Marker = require('../models/markers');
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const markers = await Marker.find({});
    res.render('markers/index', { markers })
}

module.exports.renderNewForm = (req, res) => {
    res.render('markers/new');
}

module.exports.creatMarker = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.marker.location,
        limit: 1
    }).send()


    const marker = new Marker(req.body.marker);

    marker.geometry = geoData.body.features[0].geometry;
    marker.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    marker.author = req.user._id;

    console.log(`create marker: ${marker}`);

    await marker.save();
    console.log(marker);
    req.flash('success', 'Successfully made a new marker!');
    res.redirect(`/markers/${marker._id}`)
}

module.exports.showMarker = async (req, res,) => {
    const marker = await Marker.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!marker) {
        req.flash('error', 'Cannot find that marker!');
        return res.redirect('/markers');
    }
    console.log(`marker: ${marker}`)
    res.render('markers/show', { marker });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const marker = await Marker.findById(id)
    if (!marker) {
        req.flash('error', 'Cannot find that marker!');
        return res.redirect('/markers');
    }
    res.render('markers/edit', { marker });
}


module.exports.updateMarker= async (req, res) => {
    const { id } = req.params;

    const marker = await Marker.findByIdAndUpdate(id, { ...req.body.marker });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));


    console.log(`img: ${imgs}`);

    marker.images.push(...imgs);

    await marker.save();

    if (req.body.deleteImages) {

        // delete images from cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // pull all image array with the filename for each images
        await marker.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated marker!');
    res.redirect(`/markers/${marker._id}`)
}

module.exports.deleteMarker = async (req, res) => {
    const { id } = req.params;
    await Marker.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted marker')
    res.redirect('/markers');
}