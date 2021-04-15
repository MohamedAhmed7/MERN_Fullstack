const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
const { rawListeners } = require('../../models/Profile');

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

// @route  Update api/posts/:id
// @desc   Update post by id routes
// @access private
router.post('/update/:id', passport.authenticate('jwt', { session: false }), 
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

               // update post
               const { isValid, errors } = ValidatePostInput(req.body);
               if(!isValid){
                   return res.status(400).json(errors);
               }

               post.text = req.body.text;
               post.save().then(post => res.json(post)).catch(err => res.json(err));
           })
           .catch(err => res.status(400).json({error: 'post not found'}));
       })
    }
);

// @route  POST api/posts/like/:id
// @desc   like post by id route
// @access private
router.post('/like/:id', passport.authenticate('jwt', { session: false}), 
    (req, res) => {
        // user should be logged in to like posts
        Profile.findOne({ user: req.user.id}).then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                // check if already liked before
                if (post.likes.filter(
                    like => like.user.toString() === req.user.id).length > 0){
                    return res.status(400).json({ alreadyLiked: 'User already liked this post!'});
                }

                // add like to the post
                post.likes.push({ user: req.user.id});
                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({not_found: 'post not found'}))
        }).catch(err => res.status(401).json({notAuhorized: 'User not authorized'}));
    }
);


// @route  POST api/posts/unlike/:id
// @desc   unlike post by id route
// @access private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false}), 
    (req, res) => {
        // user should be logged in to like posts
        Profile.findOne({ user: req.user.id}).then(profile => {
            Post.findById(req.params.id)
            .then(post => {
                // check if already liked before
                if (post.likes.filter(
                    like => like.user.toString() === req.user.id).length === 0){
                    return res.status(400).json({ notLiked: 'You have not liked this post!'});
                }
                
                // Get remove index
                const removeIndex = post.likes.map(item => item.user.toString())
                .indexOf(req.user.id);

                //console.log('here is fine')
                // splice out of array
                post.likes.splice(removeIndex, 1);
                post.save().then(post => res.json(post));
            })
            .catch(err => res.status(404).json({not_found: 'post not found'}))
        }).catch(err => res.status(401).json({notAuhorized: 'User not authorized'}));
    }
);

// @route  POST api/posts/comment/:id
// @desc   Add comment to a post route
// @access private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }),

    (req, res) => {
        const { isValid, errors } = ValidatePostInput(req.body);
        if(!isValid){
            return res.status(400).json(errors);
        }

        Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                user: req.user.id,
                name: req.body.name,
                avatar: req.body.avatar
            }
            //console.log('here is fine   ')
            // Add comment to comment's array
            post.comments.unshift(newComment);
            // save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({not_found: 'post not found'}));
    }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   Delete comment to a post route
// @access private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Post.findById(req.params.id)
        .then(post => {
            // check if comment exists
            if(post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(404).json({commentnotexists: "Comment doesn't exist!"});
            }
            
            //if(post.user.id === req.user.id || post.comm)
            // get remove index
            const removeIndex = post.comments.map(item => item._id.toString())
            .indexOf(req.params.comment_id);
            // splice comment from comments arrat
            post.comments.splice(removeIndex, 1);
            post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json({not_found: 'post not found'}));
    }
);


module.exports = router;