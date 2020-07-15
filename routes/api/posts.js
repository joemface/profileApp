//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();

// @route   GET api/posts
// @desc    Test route for posts api
// @access  Public
router.get('/', (req, res) => res.send('Posts route'));

//export the router
module.exports = router;
