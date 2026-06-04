const express = require('express');
const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(AuthMiddleware.protect);

router.get('/profile', UserController.getProfile);
router.put('/profile/update', UserController.updateProfile);
router.put('/avatar/update', upload.single('avatar'), UserController.updateAvatar);
router.delete('/delete', UserController.deleteAccount);

module.exports = router;
