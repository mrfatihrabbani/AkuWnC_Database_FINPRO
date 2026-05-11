const express = require('express');
const router = express.Router();
const auth = require('../auth/authMiddleware');
const { getProfile, updateBio, getDiary } = require('../controllers/userController');

router.get('/:username', getProfile);
router.get('/:username/diary', getDiary);
router.put('/update', auth, updateBio); 

module.exports = router;