const express = require('express');
const router = express.Router();
const passport = require('passport');
const { login, register } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect('/dashboard') 
);

module.exports = router;