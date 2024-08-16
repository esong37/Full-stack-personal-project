const mongoose = require('mongoose');
const cities = require('./cities'); // 1000 cities
const { places, descriptors } = require('./seedHelpers');
const Marker = require('../models/markers');

mongoose.connect('mongodb://localhost:27017/explore-hub');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Define a function called sample to randomly select an element from the array passed in
const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    // Delete all documents in the Marker collection
    // ensure that the database starts from an empty state
    await Marker.deleteMany({});

    // create 50 new Marker documents
    for (let i = 0; i < 50; i++) {
        // select a random city
        const random1000 = Math.floor(Math.random() * 1000);

        const price = Math.floor(Math.random() * 20) + 10;


        const mark = new Marker({

            // author
            author: '66bfbd96cacf7f64ee69be09',

            // generate the location of the Location using a randomly selected city and state
            location: `${cities[random1000].city}, ${cities[random1000].state}`,

            // generate the title of the Location using randomly selected elements from the descriptors and places arrays
            title: `${sample(descriptors)} ${sample(places)}`,

           

            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },

            price,

             // get a random image for each location
            image: `https://picsum.photos/400?random=${Math.random()}`,

            images: [
                {
                    url: `https://picsum.photos/400?random=${Math.random()}`,
                    filename: 'ExploreHub/ahfnenvca4tha00h2ubt'
                },
                {
                    url: `https://picsum.photos/400?random=${Math.random()}`,
                    filename: 'ExploreHub/ruyoaxgf72nzpi4y6cdi'
                }
            ]
        })
        await mark.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})