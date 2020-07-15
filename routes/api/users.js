//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Test route for usrs api
// @access  Public
router.get('/', (req, res) => res.send('Users route'));

//export the router
module.exports = router;

//copy and paste this code into auth.js, profile.js, and post.js
//make sure to change the names appropriately
//once you're done, go back to server.js and add those routes
