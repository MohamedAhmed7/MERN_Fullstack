const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile model
const Profile = require('../../models/Profile');
const { rawListeners } = require('../../models/User');
const User = require('../../models/User');


// Load validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education.js');

const profile = require('../../validation/profile');


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
    .populate('user', ['name', 'avatar'])
    .then( profile => {
        if(!profile){
            errors.no_profile = 'Profile not found';
            return res.status(404).json(errors);
        }
        return res.json(profile);

    })
    .catch( err =>  res.status(404).json(err));
});

// @route  GET api/profile/handle/:handle
// @desc   get profile by handle
// @access public
router.get('/handle/:handle', (req, res) => {

    const errors = {};

    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.no_profile = 'Profile not found for this handle';
            res.status(404).json(erros);
        }

        res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'Profile not found!'}));
});

// @route  GET api/profile/all
// @desc   get all profiles
// @access public
router.get('/all', (req, res) => {

    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles){
            errors.no_profile = 'There are no Profiles';
            res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles!'}));
});

// @route  GET api/profile/user/:user_id
// @desc   get profile by user_id
// @access public
router.get('/user/:user_id', (req, res) => {

    const errors = {};

    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.no_profile = 'User Not Found';
            res.status(404).json(erros);
        }

        res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: 'User not found!'}));
});

// @route  POST api/profile/experience
// @desc   Add experience to profile
// @access private
router.post('/experience', passport.authenticate('jwt',{ session: false}),
    (req, res) => {

        // check validation
        const { errors, isValid } = validateExperienceInput(req.body);

        if(!isValid){
            return res.status(404).json(errors);
        }
        
        // first find the user profile
        Profile.findOne({ user: req.user.id })
        .then(profile => {

            if(!profile){
                errors.no_profile = 'Profile not found!';
                res.status(404).json(errors);
            }
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.loaction,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // add new experience to profile
            profile.experience.push(newExp);
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.json(err));
    }
);

// @route  POST api/profile/education
// @desc   Add education to profile
// @access private
router.post('/education', passport.authenticate('jwt', { session: false }), 
    (req, res) => {

        // check validation
        const { errors, isValid } = validateEducationInput(req.body);

        if(!isValid){
            return res.status(404).json(errors);
        }

        Profile.findOne({ user: req.user.id })
        .then(profile => {

            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
    
            profile.education.unshift(newEdu);
            profile.save().then(profile => res.json(profile));
        })
        .catch(err => res.json(err));
    }
);



// @route  DELETE api/profile/experience
// @desc   Delete experience
// @access private
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const errors = {};
        // find user profile 
        Profile.findOne({ user: req.user.id })
        .then(profile => {
            // get remove index
            const removeIndex = profile.experience.map(item => item.id)
            .indexOf(req.params.exp_id);

            if(removeIndex < 0){
                errors.msg = "can't delete experience";
                return res.status(404).json(errors);
            }

            // Splice out of the array
            profile.experience.splice(removeIndex, 1);

            // save the profile
            profile.save().then(profile => res.json(profile))
            .catch(err => res.status(404).json(err));
            
        })
        .catch(err => res.json(err));
    }
);


// @route  DELETE api/profile/education
// @desc   Delete education
// @access private
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const errors = {};
        // find user profile 
        Profile.findOne({ user: req.user.id })
        .then(profile => {
            // get remove index
            const removeIndex = profile.education.map(item => item.id)
            .indexOf(req.params.edu_id);
            console.log(removeIndex);
            if(removeIndex < 0){
                errors.msg = "can't delete education";
                return res.status(404).json(errors);
            }
            // Splice out of the array
            profile.education.splice(removeIndex, 1);

            // save the profile
            profile.save().then(profile => res.json(profile))
            .catch(err => res.status(404).json(err));
            
        })
        .catch(err => res.json(err));
    }
);


// @route  POST api/profile
// @desc   create profile
// @access private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    
    if(!isValid){
        // return errors
        return res.status(400).json(errors);
    }

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
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }

    // social
    profileFields.social = {};

    if(req.body.youtube)  profileFields.social.youtube = req.body.youtube;
    if(req.body.insgram)  profileFields.social.insgram = req.body.insgram;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.twitter)  profileFields.social.twitter= req.body.twitter;


    Profile.findOne({ user: req.user.id })
    
    .then( profile => {
        if(profile){
            // update profile
            Profile.findOneAndUpdate(
                { user: req.user.id }, 
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
                else{
                // save new profile
                new Profile(profileFields).save().then( profile => res.json(profile)).catch(err => console.log(err));
                }
            })
        }
    })

    }
);

// @route  DELETE api/profile
// @desc   delete profile
// @access private 
router.delete('/', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id})
        .then(() => {
            User.findByIdAndRemove({ _id: req.user.id})
            .then(() => res.json({ success: 'Profile deleted successfully'}))
        });
    }
);
module.exports = router;