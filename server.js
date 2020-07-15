//express is our we framework
const express = require('express');
//app is an express app
const app = express();

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
// is a callback to confirm our connection.
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
