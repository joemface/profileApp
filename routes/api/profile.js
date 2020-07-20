//make sure to npm run server in terminal before
//making api requests in swagger
//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
//we use the profile model and user model
//to shape the payload to our user's profile
const Profile = require('../../models/Profile');
const User = require('../../models/User');
//for the github repos we need request and config
const request = require('request');
const config = require('config');
// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
//we add auth as a second parameter to authorize users.
//auth came from our own middleware
//added /me for singular user callback
router.get('/me', auth, async (req, res) => {
  try {
    //always refer to user by their id
    //since we modeled our Profile user type to be an ObjectId,
    //that's the id that gets returned.
    //also, we want the user's name and avatar image
    //.populate will help us upload that to our user's profile
    //the info comes from user model, not profile model
    //the second parameter in [ ] is the specified info we want from User model
    const profile = await (
      await Profile.findOne({ user: req.user.id })
    ).populate('user', ['name', 'avatar']);

    //if no profile
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error. GET /profile/me');
  }
});

// @route   Post api/profile
// @desc    Create and update a user profile
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //get everything from the body of the page
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      //.split says we want to split this string into an array
      //and we do that by using .split signifying the next index
      // with a separator.
      // Our separator is a comma.
      //in order to ignore white space we map through the array
      //for each skill and trim it.
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }

    // Build social object for youtube and the like
    //.social is an array of social websites
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //if profile exists in db
      if (profile) {
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      } //end of update

      //create if not found
      profile = new Profile(profileFields);

      await profile.save(); //save profile
      res.json(profile); //send back profile json
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error. GET /profile');
    }
  }
);

// @route   GET api/profile
// @desc    Get all user profiles
// @access  Public
//export the router
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error GET Public api/profile.');
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
// @param   :user_id passed to api route
router.get('/user/:user_id', async (req, res) => {
  try {
    //we want to find a user by their ID and we do that
    //with findOne as well as taking the request parameters
    // and passing it to the variable user:
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    //check that there is a profile
    if (!profile) return res.status(400).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error GET Public api/profile/user/:user_id.');
  }
});

// @route   DELETE api/profile
// @desc    Delete a user profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove user's posts
    //this will remove profile
    //user is the object id
    await Profile.findOneAndRemove({ user: req.user.id });
    //this will remove user and _id is in the db
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error DELETE Public api/profile.');
  }
});

// @route   PUT api/profile/experience
// @desc    Put experience on a user profile
// @access  Private
router.put(
  '/experience',
  [
    auth,
    [
      //these three are required
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Title is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    //creates a new object with the data the user submits
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //unshift pushes onto the beginning
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error. PUT api/profile/experience');
    }
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience on a user profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    //get the profile of the logged in user
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    //splicing out the index, only one
    profile.experience.splice(removeIndex, 1);
    //save the change
    await profile.save();

    res.json(profile);

    //so go to swagger
    //in the json response, copy the _id of the experience
    //you want to test deleting.
    //make a DELETE request to
    // http://localhost:5000/api/profile/experience/(that _id)
    // add the token to the headers
    // content-type not necessary
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. DELETE api/profile/experience/exp_id');
  }
});

// @route   PUT api/profile/education
// @desc    Put education on a user profile
// @access  Private
router.put(
  '/education',
  [
    auth,
    [
      //these four are required
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    //creates a new object with the data the user submits
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //unshift pushes onto the beginning
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error. PUT api/profile/education');
    }
  }
);

// @route   DELETE api/profile/educatoin/:edu_id
// @desc    Delete education on a user profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    //get the profile of the logged in user
    const profile = await Profile.findOne({ user: req.user.id });
    //get the index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    //splicing out the index, only one
    profile.education.splice(removeIndex, 1);
    //save the change
    await profile.save();

    res.json(profile);

    //so go to swagger
    //in the json response, copy the _id of the education
    //you want to test deleting.
    //make a DELETE request to
    // http://localhost:5000/api/profile/education/(that _id)
    // add the token to the headers
    // content-type not necessary
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. DELETE api/profile/education/edu_id');
  }
});

//we need to give this app Oauth on github to securely access repos.
//go to https://github.com/settings/applications/new
// for homepage URL and authorization callback URL
// use http://localhost:5000
//once you create the OAuth app you'll need the client ID
//and the client secret for config/defualt.json.
// the new variables are githubClientId and githubSecret

// @route   GET api/profile/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. GET api/github/:username');
  }
});

//export the router
module.exports = router;

//now go to swagger and test http://localhost:5000/api/profile/me
//or http://localhost:5000/api/profile
//copy and past token next to the header x-auth-token
// token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWYxMDcyMTkyMGYzZmQ0NjMwYjBkMTkxIn0sImlhdCI6MTU5NDkzMjEzOSwiZXhwIjoxNTk1MjkyMTM5fQ.QTOQRk1Zjq56CJ8GckvUluF036lbHYA64w520HzhYKg

//
