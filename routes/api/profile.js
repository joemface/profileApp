//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();

// @route   GET api/profile
// @desc    Test route for profile api
// @access  Public
router.get('/', (req, res) => res.send('Profile route'));

//export the router
module.exports = router;
