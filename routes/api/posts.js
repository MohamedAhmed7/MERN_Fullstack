const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');

// Profile model
const Profile = require('../../models/Profile');

// validation
const ValidatePostInput = require('../../validation/post');

// @route  Get api/posts/test
// @desc   Tests Posts routes
// @access public
router.get('/test', (req, res) => res.json({ msg: 'post ruotes works successfully'}));

// @route  POST api/posts
// @desc   Tests Posts routes
// @access private
router.post('/', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const { isValid, errors } = ValidatePostInput(req.body);

        // check validation
        if(!isValid){
            return res.status(404).json(errors);
        }
        const newPost = new Post({
            name: req.body.name,
            text: req.body.text,
            avatar: req.body.avatar,
            user: req.user.id
        });

        newPost.save().then( post => res.json(post));

    }
);

// @route  Get api/posts
// @desc   GET Posts routes
// @access public
router.get('/', (req, res) => {
    Post.find()
    .sort({ date: -1}) // sort from new to old posts
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({error: 'Posts not found!'}));
});

// @route  Get api/posts/:post_id
// @desc   GET post by id routes
// @access public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({error: 'post not found!'}));
});

// @route  DELETE api/posts/:id
// @desc   DELETE post by id routes
// @access private
router.delete('/:id', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
       Profile.findOne({ id: req.user.id })
       .then(profile => {
           Post.findById(req.params.id)
           .then(post => {
               // check if user is the owner of the post
               if(post.user.toString() !== req.user.id){
                    // forbidden
                    res.status(401).json({notAuhorized: 'User not authorized'});
               }

               // Delete the post
               post.remove().then(() => res.json({success: 'post deleted successfully'}));
           })
           .catch(err => res.status(400).json({error: 'post not found'}));
       })
    }
);
module.exports = router;