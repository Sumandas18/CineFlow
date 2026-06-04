const Admin = require('../models/Admin');
const User = require('../models/User');
const Payment = require('../models/Payment');
const DeletedUserLog = require('../models/DeletedUserLog');
const Reel = require('../models/Reel');
const Setting = require('../models/Setting');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

const sendTokenResponse = (admin, statusCode, res) => {
    const token = signToken(admin._id);

    const cookieOptions = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    };

    res.status(statusCode)
        .cookie('adminToken', token, cookieOptions)
        .json({
            success: true,
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                avatar: admin.avatar,
                securityKey: admin.securityKey,
                isEmailVerified: admin.isEmailVerified
            }
        });
};

class AdminController {
    // 1. One-time Admin Registration with OTP
    static async register(req, res, next) {
        try {
            const existingAdmin = await Admin.findOne({ isEmailVerified: true });
            if (existingAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'An admin account is already registered. To install a new admin, the existing admin account must first be permanently deleted.'
                });
            }

            const { name, email, password, securityKey } = req.body;
            if (!name || !email || !password || !securityKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields including name, email, password, and security key.'
                });
            }

            const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            let admin = await Admin.findOne({ isEmailVerified: false });
            if (admin) {
                if (admin.email === email.toLowerCase()) {
                    admin.name = name;
                    admin.password = password;
                    admin.securityKey = securityKey;
                    admin.tempPassword = password;
                    admin.otpCode = emailOtp;
                    admin.otpExpires = otpExpires;
                    await admin.save();
                } else {
                    await Admin.deleteOne({ isEmailVerified: false });
                    admin = await Admin.create({
                        name,
                        email,
                        password,
                        securityKey,
                        tempPassword: password,
                        isEmailVerified: false,
                        otpCode: emailOtp,
                        otpExpires
                    });
                }
            } else {
                admin = await Admin.create({
                    name,
                    email,
                    password,
                    securityKey,
                    tempPassword: password,
                    isEmailVerified: false,
                    otpCode: emailOtp,
                    otpExpires
                });
            }

            await emailService.sendAdminVerificationEmail(email, emailOtp);

            res.status(200).json({
                success: true,
                requiresVerification: true,
                email: admin.email,
                message: 'Admin registration initialized. Secure 6-digit OTP verification code has been sent to your email!'
            });
        } catch (error) {
            next(error);
        }
    }

    // 1b. Verify Admin Registration OTP
    static async verifyOtp(req, res, next) {
        try {
            const { email, emailOtp } = req.body;
            if (!email || !emailOtp) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide your Email OTP verification code.'
                });
            }

            const admin = await Admin.findOne({ email: email.toLowerCase(), isEmailVerified: false });
            if (!admin) {
                return res.status(400).json({
                    success: false,
                    message: 'Verification session not found or admin already verified.'
                });
            }

            if (admin.otpExpires < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'The OTP verification session has expired. Please request a new OTP set.'
                });
            }

            if (admin.otpCode !== emailOtp) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid administrative verification OTP code.'
                });
            }

            admin.isEmailVerified = true;
            admin.otpCode = undefined;
            admin.otpExpires = undefined;

            const rawPassword = admin.tempPassword || '••••••••';
            admin.tempPassword = undefined;
            await admin.save();

            // Send confirmation email containing credentials
            await emailService.sendAdminWelcomeCredentialsEmail(admin.email, rawPassword, admin.securityKey);

            sendTokenResponse(admin, 201, res);
        } catch (error) {
            next(error);
        }
    }

    // 1c. Resend Admin OTP
    static async resendOtp(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email to resend OTP.'
                });
            }

            const admin = await Admin.findOne({ email: email.toLowerCase(), isEmailVerified: false });
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Active unverified admin session not found.'
                });
            }

            const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
            admin.otpCode = emailOtp;
            admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            await admin.save();

            await emailService.sendAdminVerificationEmail(admin.email, emailOtp);

            res.status(200).json({
                success: true,
                message: 'A fresh administrative Email OTP verification code has been successfully dispatched.'
            });
        } catch (error) {
            next(error);
        }
    }

    // 2. Admin Login
    static async login(req, res, next) {
        try {
            const { email, password, securityKey } = req.body;
            if (!email || !password || !securityKey) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email, password, and security key'
                });
            }

            const admin = await Admin.findOne({ email }).select('+password');
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid administrative credentials'
                });
            }

            if (!admin.isEmailVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your admin email first. A verification OTP is required.'
                });
            }

            if (admin.securityKey !== securityKey) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid administrative security key'
                });
            }

            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid administrative credentials'
                });
            }

            sendTokenResponse(admin, 200, res);
        } catch (error) {
            next(error);
        }
    }

    // 3. Get profile
    static async getProfile(req, res, next) {
        try {
            res.status(200).json({ success: true, admin: req.admin });
        } catch (error) {
            next(error);
        }
    }

    // 4. Update profile
    static async updateProfile(req, res, next) {
        try {
            const { name, email, password, securityKey, avatar } = req.body;
            const admin = await Admin.findById(req.admin.id);
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            if (name) admin.name = name;
            if (email) admin.email = email;
            if (securityKey) admin.securityKey = securityKey;
            if (avatar) admin.avatar = avatar;
            if (password) admin.password = password;

            await admin.save();
            sendTokenResponse(admin, 200, res);
        } catch (error) {
            next(error);
        }
    }

    // 5. Delete Self (Unlocks installation)
    static async deleteSelf(req, res, next) {
        try {
            await Admin.findByIdAndDelete(req.admin.id);
            res.status(200).clearCookie('adminToken').json({
                success: true,
                message: 'Administrative account deleted completely. System unlocked for new admin registration.'
            });
        } catch (error) {
            next(error);
        }
    }

    // 6. Get Metrics and User List
    static async getStats(req, res, next) {
        try {
            const users = await User.find({}).sort('-createdAt');
            
            // User counts
            const activeUsersCount = await User.countDocuments({ status: 'active' });
            const deactivatedUsersCount = await User.countDocuments({ status: 'deactivated' });
            const deletedLogs = await DeletedUserLog.find({}).sort('-deletedAt');
            const deletedUsersCount = deletedLogs.length;

            // Income / Revenue calculation (divided by 100 to convert Razorpay paise to INR)
            const payments = await Payment.find({ status: 'paid' });
            const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount / 100), 0);

            // Group payments by plan tier
            const planDistribution = {
                Starter: await User.countDocuments({ 'subscription.plan': 'Starter' }),
                'Creator Pro': await User.countDocuments({ 'subscription.plan': 'Creator Pro' }),
                'Unlimited Pro+': await User.countDocuments({ 'subscription.plan': 'Unlimited Pro+' }),
                Free: await User.countDocuments({ 'subscription.plan': 'free' })
            };

            // Reel and Export Statistics
            const totalReelsGenerated = await Reel.countDocuments({ status: 'completed' });
            const reelsInQueue = await Reel.countDocuments({ status: { $in: ['pending', 'processing'] } });
            const failedExports = await Reel.countDocuments({ status: 'failed' });

            res.status(200).json({
                success: true,
                metrics: {
                    totalUsersCount: users.length,
                    activeUsersCount,
                    deactivatedUsersCount,
                    deletedUsersCount,
                    totalRevenue,
                    totalReelsGenerated,
                    reelsInQueue,
                    failedExports
                },
                planDistribution,
                users,
                deletedLogs
            });
        } catch (error) {
            next(error);
        }
    }

    // 7. Toggle User Status
    static async toggleUserStatus(req, res, next) {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            if (!['active', 'deactivated'].includes(status)) {
                return res.status(400).json({ message: 'Invalid status type' });
            }

            const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ success: true, user });
        } catch (error) {
            next(error);
        }
    }

    // 8. Instant Reminder Dispatch
    static async sendRenewalReminder(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const planName = user.subscription.plan || 'Free Plan';
            const expirationDate = user.subscription.endDate 
                ? new Date(user.subscription.endDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Expiring Soon';

            await emailService.sendRenewalReminderEmail(user.email, user.name, planName, expirationDate);

            res.status(200).json({
                success: true,
                message: `Renewal reminder email sent successfully to ${user.email}!`
            });
        } catch (error) {
            next(error);
        }
    }
    // 9. Get Platform Settings
    static async getSettings(req, res, next) {
        try {
            let settings = await Setting.findOne();
            if (!settings) {
                settings = await Setting.create({});
            }
            res.status(200).json({ success: true, settings });
        } catch (error) {
            next(error);
        }
    }

    // 10. Update Platform Settings
    static async updateSettings(req, res, next) {
        try {
            const { maintenanceMode, autoDeleteFailed, platformName, supportEmail } = req.body;
            let settings = await Setting.findOne();
            if (!settings) settings = new Setting();

            if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
            if (autoDeleteFailed !== undefined) settings.autoDeleteFailed = autoDeleteFailed;
            if (platformName !== undefined) settings.platformName = platformName;
            if (supportEmail !== undefined) settings.supportEmail = supportEmail;

            await settings.save();
            res.status(200).json({ success: true, settings });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;
