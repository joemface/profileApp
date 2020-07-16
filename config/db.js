//here is where we will commit to our mongodb connection
//first bring in mongoose dependency attributes for db connection
const mongoose = require('mongoose');

//next we want to bring in our mongoURI config string inside
//default.json
const config = require('config');

//using .get for config allows us to get any values already there
//currently we created mongoURI ourselves. here is where we access it
const db = config.get('mongoURI');

//now we use mongoose to our advantage for database connectivity
//first we need something we can call within our server.js app file
//that's where connectDB comes from, using an asynchronous arrow function.
//we create a async await function to handle connectivity
const connectDB = async () => {
  //when attempting to make any connections
  //always use a try catch for errors and safety
  try {
    //since mongoose returns a promise we want "await" appended in front
    //so the server awaits a promised response from db variable.
    //we also throw in a second paramater becuase of the fact that
    // we get a deprecation warning without it (useNewUrlParser)
    //same with the others grouped with it. basically some features
    //i'm using are old and need to be told to use modern versions
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    //the next string let's us know in the console that we're connected
    console.log('MongoDB Connected...');
  } catch (err) {
    //log an error if we didn't successfully connect to the db
    //the err in catch has a '.message' property for logging errors
    console.error(err.message);
    //and if we want the application to fail we do that with
    process.exit(1);
  }
};

//lastly we export everything we just achieved (or didn't) with that
//asynchronous function
module.exports = connectDB;

//next go back to server.js
