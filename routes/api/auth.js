//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();
const User = require('../../models/User');

//bring in middleware for authorization
const auth = require('../../middleware/auth');

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

//export the router
module.exports = router;

//{
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWYxMDcyMTkyMGYzZmQ0NjMwYjBkMTkxIn0sImlhdCI6MTU5NDkxMzMwNSwiZXhwIjoxNTk0OTE2OTA1fQ.xNQJYSR9QOmLgc4trkFvT4Ioh018A_cqLbZRT2pYPCE"
//}
//take the above token to swagger
//GET http://localhost:5000/api/auth
// click Authentication & Headers
//only fill in Request Headers
// x-auth-token in first parameter and the above token
// value in the second parameter
//hit send
