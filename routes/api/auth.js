//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
//bring in middleware for authorization
const auth = require('../../middleware/auth');
//bring in secret key form config
const config = require('config');
//authorization
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
// @route   GET api/auth
// @desc    Test route for auth api
// @access  Public
//to use the middleware we use it as second parameter
router.get('/', auth, async (req, res) => {
  try {
    //we don't want to return the password, so we use .select
    // and tell it to literally subtract the password from data
    const user = await await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//we want to auhorize users for logging in as well.
//we just copied this function from users.js because
// logging in works like registration in some aspects
// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post(
  '/',
  [
    //first parameter checks if input is valid email/password
    //second parameter returns error response if none
    check('email', 'Email is invalid').isEmail(),
    check('password', 'Password is requried').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      //we want to see if user exists
      let user = await User.findOne({ email });
      //if that user email doesn't exist, error
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email or password is incorrect.' }] });
      }
      //we need to make sure the password matches
      //we can use bcryptjs compare method which returns a promise
      //pased on comparing entered password and user's email password from db
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Email or password is incorrect.' }] });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      console.log(req.body);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);
//export the router
module.exports = router;

//{
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWYxMDcyMTkyMGYzZmQ0NjMwYjBkMTkxIn0sImlhdCI6MTU5NDkzMjEzOSwiZXhwIjoxNTk1MjkyMTM5fQ.QTOQRk1Zjq56CJ8GckvUluF036lbHYA64w520HzhYKg"
//}
//take the above token to swagger
//GET http://localhost:5000/api/auth
// click Authentication & Headers
//only fill in Request Headers
// x-auth-token in first parameter and the above token
// value in the second parameter
//hit send
