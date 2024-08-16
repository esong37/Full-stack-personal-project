if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
// flash message and id identification
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//Sets various HTTP headers to help protect against many known web vulnerabilities
//need to add the crossorigin="anonymous" attribute to all HTML elements that contain external resources.
const helmet = require('helmet');

// ignore weired query (symbols)
// simply avoid mongo sql injection
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const markerRoutes = require('./routes/marker');
const reviewRoutes = require('./routes/reviews');

// MongoDB session store for Connect and Express
const MongoStore = require('connect-mongo');

// online db url
//const dbURL = process.env.DB_URL;
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/explore-hub';
//const dbURL = 'mongodb://localhost:27017/explore-hub';

/**
 * connect to db
 */
//mongoose.connect('mongodb://localhost:27017/explore-hub');
mongoose.connect(dbURL);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


/**
 * configuration for app
 */
const app = express();

// ejs-mate: to do some layout
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// public folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';


// new mongo connection
// use mongo to store session
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


/**
 * Session
 */
const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {   
        // http secure
        //secure: true,
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

// use flash and 
app.use(flash());

app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dgwxv1zwp/", 
                "https://fastly.picsum.photos/",
                "https://picsum.photos/",
                "https://images.unsplash.com"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




// passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
// use the router we created 
// separate router in different files
app.use('/markers', markerRoutes);
//  to access id here need express.Router({mergeParams : true});
app.use('/markers/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home')
});





// for every request
// when no matching route is found
// the next function is called and passed a new ExpressError instance
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Error handling middleware functions
app.use((err, req, res, next) => {
    // Extract the statusCode property from the error object err, the default is 500
    const { statusCode = 500 } = err;

    // If the error object does not provide a message, set a default message for it.
    if (!err.message) err.message = 'No!!!!! Something Went Wrong!'

    // Set the response status code to statusCode, 
    // render a view template named error,
    // pass the error object err to the template.
    res.status(statusCode).render('error', { err })
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})