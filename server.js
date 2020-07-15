//express is our we framework
const express = require('express');
//app is an express app
const app = express();

//this next line makes way more sense
// after completing everything else on this page
//the very async function we created was exported, right?
//now that exported data is in this connectDB variable
// since it's in a different folder we have to say where
// our connectDB function is ./config/db
const connectDB = require('./config/db');

///////////////////////////////////////////////////////////////////////////////////
//now we that we imported our connectDB function we can actually just call it.
//and you should see your connection confirmation string from the try in db.js
connectDB();

//this is an endpoint for first test
//takes a get request to /
//the second parameter is our callback to our
// request. It's a response variable where
//res.send() sends data to the browser
app.get('/', (req, res) => res.send('Successful API connection!'));

//what this does is look for an environment variable
//called PORT which will transfer the PORT number
//to Heroku. The || (or) symbol allows us to run
// local host on PORT 5000.
const PORT = process.env.PORT || 5000;

//for now we just want a reaction for connecting to PORT
//and we want the response to be an OK. The second parameter
// is a callback to confirm our connection which pops up in
// the terminal.
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// we could run this app with node server or server.js but
// we can modify package.json and change "test" to "start"
// and change the text following "start" to "node server"
// which is the script Heroku will use to deploy.
// however, for developent, we want to use nodemon
// to do that, add a comma and "server":"nodemon server"
// below "start". now we don't have to refresh the
// server for changes.
// now you can type in the terminal npm run server
// you can now type http://localhost:5000 in the browser
// or swagger

//for our database we create a folder named config
//inside that folder we create a file named default.json
// so going back to one of the dependices we downloaded with npm
// it's name is config inside the package.json file which is a
// default json file with defautl json values, in this case,
// it's for our mongodb string, aka, mongoURI, the one i said
//to keep for later
//mongodb string
// mongodb+srv://<username>:<password>@devconnector-dsgby.mongodb.net/<dbname>?retryWrites=true&w=majority

//now, we don't want to clutter up this file with our db connection
// logic. So, we create a file in config named db.js
