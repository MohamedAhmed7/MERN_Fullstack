const express = require('express')
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// load user model
const User = require('../../models/User');

// @route  GET api/users/test
// @desc test user route 
// @access public
router.get('/test', (req, res) => res.json({msg: "users works"}));

// @route  POST api/users/register
// @desc register user
// @access public
router.post('/register', (req, res) => {
    User.findOne({email: req.body.email})
        .then( user => {
            if(user){
                return res.status(400).json({ msg: 'email already taken'});
            } else{
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // size
                    r: 'pg',  // rating
                    d: 'mm'   // default
                });
                // creating new user
                const newUser = User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });
                // hashing user password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(erro));
                    })
                })
            }
        });
});

// @route  POST api/users/login
// @desc   login user / return token
// @access public
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // check user by mail
    User.findOne({email})
    .then(user => {
        if(!user){
            res.status(400).json({email:'Email not Found!'});
        }

        // check password
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(!isMatch){
                res.status(400).json({password: 'incorrect password'});
            } else{
                // craete a token here!
                const payload = { id: user.id, name: user.name, avatar: user.avatar };

                jwt.sign(
                    payload,
                    keys.secretOrKey, 
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                    }
                    );
            }
        });
    })
});

// @route  GET api/users/current
// @desc   return current user
// @access private
router.get('/current', 
    passport.authenticate('jwt', { session: false}), 
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            date: req.user.date
        });
});
module.exports = router;