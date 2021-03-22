const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
const { rawListeners } = require('../../models/User');
const User = require('../../models/User');


// @route  GET api/profile/test
// @desc test profile route 
// @access public
router.get('/test', (req, res) => res.json({msg: "profile works"}));


// @route  GET api/profile
// @desc   get current user profile
// @access private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
    .then( profile => {
        if(!profile){
            errors.no_profile = 'Profile not found';
            return res.status(404).json(errors);
        }
        return res.json(profile);

    })
    .catch( err =>  res.status(404).json(err));
});

// @route  POST api/profile
// @desc   create profile
// @access private
router.get('/', passport.authenticate('jwt', { sesstion: false }), (req, res) => {
    const errors = {};
    
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    
    // skills split into arrays
    if(typeof req.body.skill !== 'undefined'){
        profileFields.skills = req.body.skill.split(',');
    }

    // social
    profileFields.social = {};

    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.insgram) profileFields.social.insgram = req.body.insgram;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.twitter) profileFields.social.ytwitter= req.body.twitter;


    Profile.findOne({ user: req.user.id })
    .then( profile => {
        if(profile){
            // update profile
            Profile.findByIdAndUpdate(
                { user: raq.user.id }, 
                { $set: profileFields },
                { new: true }
                )
                .then( profile => res.json(profile));
        }
        else{
            // create new profile
            // check for handle
            Profile.findOne({ handle: profileFields.handle })
            .then( profile => {
                if(profile){
                    errors.handle = 'That handle already exists';
                    return res.status(400).json(errors);
                    
                }
                // save new profile
                new Profile(profileFields).save().then( profile => res.json(profile));
            })
        }
    })

    }
);
module.exports = router;