//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @desc    Test route for auth api
// @access  Public
router.get('/', (req, res) => res.send('Auth route'));

//export the router
module.exports = router;
