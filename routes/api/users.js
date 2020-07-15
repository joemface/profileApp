//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();

//now that we are certain our POST works, we need to
// validate (sanitize) user input. that comes from express-validator
//we can create two variables
//docs on how and why are here https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');

// @route   POST api/users
// @desc    Register user
// @access  Public
//we create a second set of parameters which takes in an array of
// requested valdations
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is invalid').isEmail(),
    check(
      'password',
      'Please enter a valid password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //if invalid informatin, error 400, bad information
      //and we want it to be sent to our formatted api
      //especially if it's an error. errors takes on the
      //validationResult errors.array() method passed to
      //our new errors: variable name which is formatted as a json
      return res.status(400).json({ errors: errors.array() });
    }
    //we can view what is posted with the console and req.body
    console.log(req.body);
    res.send('Users route');
  }
);

//export the router
module.exports = router;

//copy and paste this code into auth.js, profile.js, and post.js
//make sure to change the names appropriately
//once you're done, go back to server.js and add those routes

//to use this POST method we go to postman or swagger
// and change GET to POST http://localhost:5000/api/users
// in Headers add application/json for content-type
//in the body we're going to send raw json info
