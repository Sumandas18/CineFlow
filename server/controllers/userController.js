const User = require('../models/User');
const DeletedUserLog = require('../models/DeletedUserLog');
const cloudinary = require('../config/cloudinary');

class UserController {
    static async getProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            res.status(200).json({ success: true, user });
        } catch (error) {
            next(error);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const { name, bio, password } = req.body;
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            if (name) user.name = name;
            if (bio) user.bio = bio;
            if (password) user.password = password; // Mongoose hook will hash this on save

            await user.save();

            // Return user without password
            const updatedUser = await User.findById(req.user.id);
            res.status(200).json({ success: true, user: updatedUser });
        } catch (error) {
            next(error);
        }
    }

    static async updateAvatar(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'Please upload an image' });
            }

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'creator_os_ai/avatars',
                width: 150,
                crop: 'scale'
            });

            const user = await User.findByIdAndUpdate(
                req.user.id,
                { avatar: result.secure_url },
                { new: true }
            );

            res.status(200).json({ success: true, user });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAccount(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            if (user) {
                await DeletedUserLog.create({
                    name: user.name,
                    email: user.email
                });
            }
            await User.findByIdAndDelete(req.user.id);
            res.status(200).json({ success: true, message: 'Account deleted' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
