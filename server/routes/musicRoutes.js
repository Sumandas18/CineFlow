const express = require('express');
const MusicController = require('../controllers/musicController');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', MusicController.getMusic); // Public or user facing
router.get('/search', MusicController.searchMusic); // Search via yt-search
router.get('/stream', MusicController.streamMusic); // Stream youtube audio

// Admin only routes
router.post('/', AuthMiddleware.protect, AuthMiddleware.authorize('admin'), MusicController.addMusic);
router.put('/:id/deactivate', AuthMiddleware.protect, AuthMiddleware.authorize('admin'), MusicController.deactivateMusic);

module.exports = router;
