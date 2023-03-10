const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Harrisagoodboy";
var jwt = require('jsonwebtoken');

/*

Endpoints for auth:
1- createuser
2- login 

*/

// ROUTE 1: Create a User using: POST "/api/auth/createuser", No login required.
router.post('/createuser', [
        body('name','Enter a valid name').isLength({ min: 3}),
        body('email','Enter a valid email').isEmail(),
        body('password','Password must be atleast 5 characters').isLength({ min: 5}),
    ],
    async (req,res)=>{

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        // Check whether the email exists already
        try {
            let user = await User.findOne({email: req.body.email});
            if (user){
                return res.status(400).json({error: "Sorry a user with this email already exists"});
            }

            const salt = await bcrypt.genSalt(10);
            secPass = await bcrypt.hash(req.body.password, salt);

            // Create a new user
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            })

            const data = {
                user:{
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({authtoken});

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
)

// ROUTE 2: Login using: POST "/api/auth/login", No login required.
router.post('/login', [
        body('email','Enter a valid email').isEmail(),
        body('password','Password cannot be blank').exists()
    ],
    async (req,res)=>{

        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        const {email, password} = req.body;
        try {
            let user = await User.findOne({email});

            // if user doesn't exis
            if (!user){
                return res.status(400).json({error: "Please try to login with correct credentials."})
            }

            const passwordCompare = await bcrypt.compare(password, user.password);

            // if password not correct 
            if (!passwordCompare){
                return res.status(400).json({error: "Please try to login with correct credentials."})
            }

            // if password correct
            const data = {
                user:{
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({authtoken})

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
)

// ROUTE 3: Get loggiedin User Details using: POST "/api/auth/getuser", login required.
router.post('/getuser', fetchuser, async (req, res)=>{

    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }   
})

module.exports = router