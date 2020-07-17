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
    //the second parameter is the specified info we want from User model
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
    res.status(500).send('Server Error');
  }
});

// @route   Post api/profile
// @desc    Create or update a user profile
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
      res.status(500).send('Server Error');
    }
  }
);
//export the router
module.exports = router;

//now go to swagger and test http://localhost:5000/api/profile/me
//copy and past token next to the header x-auth-token
// token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWYxMDcyMTkyMGYzZmQ0NjMwYjBkMTkxIn0sImlhdCI6MTU5NDkzMjEzOSwiZXhwIjoxNTk1MjkyMTM5fQ.QTOQRk1Zjq56CJ8GckvUluF036lbHYA64w520HzhYKg
