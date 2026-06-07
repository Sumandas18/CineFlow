const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const cloudinary = require('../config/cloudinary');

class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            let avatarUrl = undefined;
            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'creator_os_ai/avatars',
                    width: 150,
                    crop: 'scale'
                });
                avatarUrl = result.secure_url;
            }

            const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

            const user = await User.create({
                name,
                email,
                password,
                verificationToken,
                avatar: avatarUrl
            });

            // Log OTP for easy local testing
            if (process.env.NODE_ENV === 'development') {
                console.log(`\n========================================`);
                console.log(`🔑 DEV OTP for ${email}: ${verificationToken}`);
                console.log(`========================================\n`);
            }

            await emailService.sendVerificationEmail(email, verificationToken);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email to verify your account.'
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password, remember } = req.body;

            const user = await User.findOne({ email }).select('+password');
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            if (!user.isEmailVerified) {
                return res.status(401).json({ message: 'Please verify your email first' });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d'
            });

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            };
            
            if (remember) {
                cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }

            res.cookie('token', token, cookieOptions);

            user.password = undefined;

            res.status(200).json({
                success: true,
                token,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res) {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }

    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;

            const user = await User.findOne({ verificationToken: token });
            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired verification token' });
            }

            user.isEmailVerified = true;
            user.verificationToken = undefined;
            await user.save();

            res.status(200).json({ success: true, message: 'Email verified successfully' });
        } catch (error) {
            next(error);
        }
    }

    static async getMe(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            
            if (user) {
                // Reset daily credits for ALL users
                const now = new Date();
                const lastReset = user.lastCreditResetDate || new Date(0);
                
                if (now.getDate() !== lastReset.getDate() || 
                    now.getMonth() !== lastReset.getMonth() || 
                    now.getFullYear() !== lastReset.getFullYear()) {
                    
                    user.aiUsageCount = 0;
                    user.lastCreditResetDate = now;
                    await user.save();
                }

                // Calculate max limit based on plan
                let maxLimit = 3; // Free default
                if (user.subscription && user.subscription.status === 'active') {
                    switch(user.subscription.plan) {
                        case 'Starter': maxLimit = 10; break;
                        case 'Creator Pro': maxLimit = 30; break;
                        case 'Unlimited Pro+': maxLimit = 50; break;
                    }
                }

                return res.status(200).json({ 
                    success: true, 
                    user,
                    aiLimits: {
                        usageCount: user.aiUsageCount,
                        maxLimit: maxLimit,
                        remaining: Math.max(0, maxLimit - user.aiUsageCount)
                    }
                });
            }

            res.status(404).json({ success: false, message: 'User not found' });
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'No user found with that email' });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');
            
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpire = Date.now() + 3600000; // 1 hour expiry
            await user.save({ validateBeforeSave: false });

            await emailService.sendPasswordResetEmail(email, resetToken);

            res.status(200).json({
                success: true,
                message: 'Password reset link sent to email'
            });
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpire: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired password reset token' });
            }

            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
