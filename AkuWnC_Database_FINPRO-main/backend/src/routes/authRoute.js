const express = require('express');
const router = express.Router();
const passport = require('passport');
const { login, register } = require('../controllers/authController');

// Standard Email/Password
router.post('/register', register);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/dashboard') // Redirect to your Tailwind frontend
);

module.exports = router;