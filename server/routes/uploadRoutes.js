const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', AuthMiddleware.protect, upload.single('media'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No media uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'creatoros_uploads',
            resource_type: 'auto'
        });

        // Cleanup local temp file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
        });

        res.status(200).json({ success: true, url: result.secure_url });
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        next(error);
    }
});

module.exports = router;
