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

//pass in the id of the post
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
      return res.status(404).json({ msg: 'Post not found' });
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
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error. DELETE api/post/:id');
  }
});

//pass in the id of the post, not the user
// @route   PUT api/posts/like/:id
// @desc    Put a like on a post
// @access  Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if post has already been liked by a user
    //we want to filter through the likes array which
    // takes in a function. We use an arrow function to
    // quickly name our function like which we would like
    // to compare to the req.user.id so we use toString()
    // so we use === for comparison to the user trying to like
    // to filter and see if that is equal to 1 (meaning greater than zero).
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    //unshift puts in in the beginning
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. PUT api/posts/like/:id');
  }
});

//pass in the id of the post, not the user
// @route   PUT api/posts/unlike/:id
// @desc    Put removal of liking a post
// @access  Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not been liked' });
    }
    //get the index of post we're trying to unlike
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    //splice (aka remove) 1 out of the likes array
    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error. PUT api/posts/unlike/:id');
  }
});

//pass in the id of the post
// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //because the user is logged in we can just get their id
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error: POST api/posts/comment/:id');
    }
  }
);

// @params  Pass in the post id then the comment id
// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment on a post
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Pull out comment. This will either pull out the
    // comment or return false
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist!' });
    }

    // check user is the one who commented
    //comment.user is an object id and we need  to convert to a string
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User is not authorized!' });
    }

    //get the index of post we're trying to unlike
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    //splice (aka remove) 1 out of the likes array
    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .send('Server error. DELETE api/posts/comment/:id/:comment_id');
  }
});
//export the router
module.exports = router;
