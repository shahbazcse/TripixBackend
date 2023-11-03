require('./db/db.connection');

const express = require('express');
const app = express();
app.use(express.json());

const Destination = require('./models/destination.model');
const User = require('./models/user.model');

app.get('/',(req,res) => {
  res.send("Hello, Express!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Creating a Travel Destination API

app.post('/destinations', async (req, res) => {
  try{
    const { destinationData } = req.body;
    const destination = await createTravelDestination(destinationData);
    
    res.status(201).json({
      message: "Destination Created",
      destination,
    })
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
});

async function createTravelDestination(destinationData){
  try{
    const newDestination = new Destination(destinationData);
    const destination = await newDestination.save();
    return destination;
  }catch(error){
    throw error;
  }
};

// Reading Travel Destinations by Rating API

app.get('/destinations/rating', async (req, res) => {
  try{
    const destinations = await readTravelDestinationsByRating();

    res.status(200).json({
        message: "Destinations Found",
        destinations
      })
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
})

async function readTravelDestinationsByRating(){
  try{
    const destinations = await Destination.find().sort({ rating: -1 });
    return destinations;
  }catch(error){
    throw error
  }
}

// Reading a Travel Destination API

app.get('/destinations/:name', async (req, res) => {
  try{
    const { name } = req.params;
    const destination = await readTravelDestination(name);

    if(destination){
      res.status(200).json({
        message: "Destination Found",
        destination
      })
    }else{
      res.status(404).json({
        message: "Destination Not Found",
      })
    }
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
})

async function readTravelDestination(destinationName){
  try{
    const destination = await Destination.findOne({ name: destinationName });
    return destination;
  }catch(error){
    throw error
  }
}

// Reading All Travel Destinations API

app.get('/destinations', async (req, res) => {
  try{
    const destinations = await readAllTravelDestinations();

    res.status(200).json({
        message: "Destinations Found",
        destinations
      })
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
})

async function readAllTravelDestinations(){
  try{
    const destinations = await Destination.find();
    return destinations;
  }catch(error){
    throw error
  }
}

// Reading Travel Destinations by Location API

app.get('/destinations/location/:location', async (req, res) => {
  try{
    const { location } = req.params;
    const destinations = await readTravelDestinationsByLocation(location);

    if(destinations.length){
      res.status(200).json({
        message: "Destinations Found",
        destinations
      })
    }else{
      res.status(404).json({
        message: "No Travel Destinations Found",
      })
    }
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
})

async function readTravelDestinationsByLocation(locationName){
  try{
    const destinations = await Destination.find({ location: { $regex: locationName, $options: "i" } });
    return destinations;
  }catch(error){
    throw error
  }
}

// Updating a Travel Destination API

app.post('/destinations/:destinationId', async (req, res) => {
  try{
    const { destinationId } = req.params;
    const { updatedData } = req.body;
    const destination = await updateTravelDestination(destinationId, updatedData);

    res.status(200).json({
        message: "Destination Updated",
        destination
      })
  }catch(e){
    res.status(404).json({
      message: "Destination Not Found",
    })
  }
})

async function updateTravelDestination(destinationId, updatedData){
  try{
    const destination = await Destination.findByIdAndUpdate(destinationId, updatedData, { new: true });
    return destination;
  }catch(error){
    throw error
  }
}

// Deleting a Travel Destination API

app.delete('/destinations/:destinationId', async (req, res) => {
  try{
    const { destinationId } = req.params;
    const destinations = await deleteTravelDestination(destinationId);

    res.status(200).json({
        message: "Destination Deleted",
        destinations
      })
  }catch(e){
    res.status(404).json({
      message: "Destination Not Found",
    })
  }
})

async function deleteTravelDestination(destinationId){
  try{
    await Destination.findByIdAndDelete(destinationId);
    const destinations = await Destination.find();
    return destinations;
  }catch(error){
    throw error
  }
}

// Filtering Destinations by Minimum Rating API

app.get('/destinations/filter/:minRating', async (req, res) => {
  try{
    const { minRating } = req.params;
    const destinations = await filterDestinationsByRating(Number(minRating));

    res.status(200).json({
        message: "Destinations Found",
        destinations
      })
  }catch(e){
    res.status(500).json({
      message: e.message,
    })
  }
})

async function filterDestinationsByRating(minRating){
  try{
    const destinations = await Destination.find({ rating: { $gte: minRating } });
    return destinations;
  }catch(error){
    throw error
  }
}

// Adding Reviews to a Travel Destination API

app.post('/destinations/:destinationId/reviews', async (req, res) => {
  try{
    const { destinationId } = req.params;
    const { reviewData } = req.body;
    const destination = await addReview(destinationId, reviewData);

    res.status(200).json({
        message: "Review Added To Destination",
        destination,
      })
  }catch(e){
    res.status(404).json({
      message: "Destination Not Found",
    })
  }
})

async function addReview(destinationId, reviewData){
  try{
    const destination = await Destination.findById(destinationId);

    destination.reviews.push(reviewData);
    const updatedDestination = await destination.save();
    return updatedDestination;
  }catch(error){
    throw error;
  }
}

// Retrieving Reviews of a Travel Destination API

app.get('/destinations/:destinationId/reviews', async (req, res) => {
  try{
    const { destinationId } = req.params;
    const reviews = await getDestinationReviewsWithUserDetails(destinationId);

    res.status(200).json({
        message: "Reviews Found",
        reviews,
      })
  }catch(e){
    res.status(404).json({
      message: "Destination Not Found",
    })
  }
})

async function getDestinationReviewsWithUserDetails(destinationId){
  try{
    const destinations = await Destination.findById(destinationId).populate({
      path: 'reviews',
      populate: {
        path: 'userId',
        select: 'username profilePictureUrl',
      }
    })

    const firstThreeReviews = destinations.reviews.slice(0,3).map((review) => ({
        reviewText: review.reviewText,
        user: review.userId,
      }));
      return firstThreeReviews;
  }catch(error){
    throw error;
  }
}