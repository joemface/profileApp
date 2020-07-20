//we need to bring an express router for having this
//route in a different folder
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const { route } = require('./profile');
// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //because the user is logged in we can just get their id
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error: POST api/posts');
    }
  }
);

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    //the -1 for date gets the most recent
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. GET api/posts');
  }
});

// @route   GET api/posts/:id
// @desc    Get a post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    //the -1 for date gets the most recent
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    //if it's not a formatted object id
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error. GET api/posts/:id');
  }
  //to use this router you copy the _id of any post
  // and past it where /:id goes
  // http://localhost:5000/api/posts/(_id here)
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    //the -1 for date gets the most recent
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(400).json({ msg: 'Post not found' });
    }
    //check user. we need toString because
    //req.user.id is a string
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error. DELETE api/post/:id');
  }
});

//export the router
module.exports = router;
