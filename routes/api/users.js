//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
//now that we are certain our POST works, we need to
// validate (sanitize) user input. that comes from express-validator
//we can create two variables
//docs on how and why are here https://express-validator.github.io/docs/
const { check, validationResult } = require('express-validator');

//bring in our User model
//the double ../ is necessary because we go back two folders,
//namely api and routes, to find the models folder
const User = require('../../models/User');

//we need to bring bcryptjs for password encryption
const bcrypt = require('bcryptjs');
//bring in secret key form config
const config = require('config');

//authorization
const jwt = require('jsonwebtoken');
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
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      //if invalid informatin, error 400, bad information
      //and we want it to be sent to our formatted api
      //especially if it's an error. errors takes on the
      //validationResult errors.array() method passed to
      //our new errors: variable name which is formatted as a json
      return res.status(400).json({ errors: errors.array() });
    }

    //the next line will create three variables and get
    //their corresponding value from req.body
    const { name, email, password } = req.body;

    try {
      //we want to see if user exists
      let user = await User.findOne({ email });
      //if that user email exists, error
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }
      //get user's gravatar
      //if valid user email, get their gravatar
      // we just need to pass the user's email to a method
      // and we can get their gravatar
      //s is status. r is page rating (no nudes) d is default image
      //mm is just a default image icon. you could do 404 for image broken
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });
      //ecrypt password
      //first create a salt for hashing
      //we can get a promise from bcyrptjs gensalt promise
      //anytime we expect a promise as a response we have to
      // await. We pass in "rounds" and we say 10 is sufficient
      const salt = await bcrypt.genSalt(10);
      //now we take the user password and salt it
      //which takes a hash and sets it as the user password
      user.password = await bcrypt.hash(password, salt);

      //we need to add this to the database
      //use save but it returns a promise so use await
      await user.save();

      // return json web token
      const payload = {
        user: {
          id: user.id,
        },
      };
      //below is our jwt signature for our jwt token
      //when a user registers this will generate their session
      //token
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //we can view what is posted with the console and req.body
      console.log(req.body);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
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
// {
//   "name":"Justin",
//   "email":"justin@email.com",
//   "password":"password6"
// }

//by now you should be able to test http://localhost:5000/api/users
//with valid raw data entered of the body as json format
// and it will register the user in your Mongodb collections
