const express = require('express');
const AIController = require('../controllers/aiController');
const AuthMiddleware = require('../middleware/authMiddleware');
const SubscriptionMiddleware = require('../middleware/subscriptionMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(AuthMiddleware.protect);

router.post('/generate', 
    SubscriptionMiddleware.checkUsage, 
    upload.array('media', 5), 
    AIController.generate
);

router.post('/analyze', AIController.analyze);

router.post('/analyze-image', 
    upload.single('image'), 
    AIController.analyzeImage
);

module.exports = router;
