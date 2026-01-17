const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { OAuth2Client } = require('google-auth-library');
const auth = require('../middleware/auth');
const Address = require('../models/address');


const router = express.Router();


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }


        if (!user.isVerified) {
            return res.status(403).json({
                error: 'Please verify your email before logging in'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // 1️⃣ Try to get DEFAULT address
        let address = await Address.findOne({
            user: user._id,
            isDefault: true
        });

        // 2️⃣ If no default, get latest address
        if (!address) {
            address = await Address.findOne({ user: user._id })
                .sort({ createdAt: -1 });
        }

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            address
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Please provide name, email and password'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

        await User.create({
            name,
            email,
            password,
            otp,
            otpExpiresAt,
            isVerified: false
        });

        // ✅ DEV MODE RESPONSE
        res.status(201).json({
            message: 'OTP generated',
            otp,
            expiresIn: '10 minutes'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        // Verify the token against your Google Client ID
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        // Extracting 'sub' is important for your 'googleId' field
        const { email, name, picture, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            user = await User.create({
                name,
                email,
                avatar: picture,
                googleId: sub, // 'sub' is the unique Google ID
                authProvider: 'google',
                isVerified: true
            });
        } else if (user.authProvider !== 'google') {
            // Update existing user to Google provider if needed
            user.authProvider = 'google';
            user.googleId = sub;
            await user.save();
        }

        // Generate your internal JWT for the app session
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            } 
        });

    } catch (err) {
        console.error('Google login error:', err.message);
        res.status(401).json({ error: err.message });
    }
});


router.post('/logout', auth, (req, res) => {
    return res.json({
        message: 'Logout successful'
    });
});


/*
verify OTP and activate user account
*/

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
        return res.status(400).json({ error: 'User already verified' });
    }

    if (
        user.otp !== otp ||
        user.otpExpiresAt < Date.now()
    ) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
});



router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});





module.exports = router;