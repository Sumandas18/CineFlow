const express = require('express');
const ReelController = require('../controllers/reelController');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(AuthMiddleware.protect);

router.post('/', ReelController.createReel);
router.get('/', ReelController.getUserReels);
router.get('/:id', ReelController.getReel);
router.post('/:id/ai-metadata', ReelController.generateAIMetadata);

module.exports = router;
