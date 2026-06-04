const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendVerificationEmail(email, token) {
        const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        await this.transporter.sendMail({
            from: `"CreatorOS AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - CreatorOS AI',
            html: `
                <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <!-- Anti-Collapsing Unique Token -->
                    <span style="display: none; font-size: 1px; color: #0A0A0C; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${Date.now()}</span>
                    
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <tr>
                            <td>
                                <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #e9d5ff; background: rgba(139, 92, 246, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                    CREATOROS AI
                                </div>
                                <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Verify Your Email</h1>
                                <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    Welcome to CreatorOS! Please use the secure 6-digit OTP code below to verify your identity and activate your account.
                                </p>
                                
                                <div style="background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 16px; padding: 16px 24px; display: inline-block; margin-bottom: 24px;">
                                    <div style="font-size: 10px; font-weight: 700; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Your 6-Digit OTP</div>
                                    <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 8px;">${token}</span>
                                </div>
                                
                                <p style="color: #71717A; font-size: 13.5px; line-height: 1.6; margin: 0 0 12px 0;">
                                    Enter this code directly inside your interactive registration dashboard to complete your account activation.
                                </p>

                                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                    <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            `
        });
    }

    async sendPasswordResetEmail(email, token) {
        const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        await this.transporter.sendMail({
            from: `"CreatorOS AI" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - CreatorOS AI',
            html: `
                <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                        <tr>
                            <td>
                                <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #fbcfe8; background: rgba(236, 72, 153, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                    SECURITY ACCESS
                                </div>
                                <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Reset Your Password</h1>
                                <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                    You requested a password reset. Click the button below to configure new login credentials securely.
                                </p>
                                
                                <div style="margin-bottom: 32px; margin-top: 16px;">
                                    <a href="${url}" style="background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);">
                                        Reset Password Credentials
                                    </a>
                                </div>

                                <p style="color: #71717A; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
                                    If you did not request a password reset, please ignore this email safely.
                                </p>

                                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                    <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            `
        });
    }

    async sendRenewalReminderEmail(email, name, planName, expirationDate) {
        try {
            await this.transporter.sendMail({
                from: `"CreatorOS AI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Action Required: Renew Your Plan - CreatorOS AI',
                html: `
                    <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <tr>
                                <td>
                                    <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #e9d5ff; background: rgba(139, 92, 246, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                        RENEWAL NOTICE
                                    </div>
                                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Hi ${name},</h1>
                                    <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                        Your active subscription tier <strong>${planName}</strong> is expiring soon on <strong>${expirationDate}</strong>.
                                    </p>
                                    <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                        To maintain premium render speed, 4K exports, and unlimited AI hook generators, click the link below to verify your pricing benefits and renew today!
                                    </p>
                                    
                                    <div style="margin-bottom: 32px; margin-top: 16px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing" style="background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 100px; font-size: 14px; font-weight: 700; display: inline-block; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);">
                                            Renew Premium Plan
                                        </a>
                                    </div>
     
                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                        <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            });
        } catch (err) {
            console.error('Error sending renewal reminder email:', err);
        }
    }

    async sendAdminVerificationEmail(email, otp) {
        try {
            await this.transporter.sendMail({
                from: `"CreatorOS Admin Secure Core" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'URGENT: Verify Super Admin Registration OTP - CreatorOS AI',
                html: `
                    <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <tr>
                                <td>
                                    <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #fbcfe8; background: rgba(236, 72, 153, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                        ADMIN PRIVILEGES
                                    </div>
                                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Verify Admin Session</h1>
                                    <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                        An administrative account setup request has been initiated. Enter the 6-digit administrative verification OTP below to finalize your Super Admin session.
                                    </p>
                                    
                                    <div style="background: rgba(236, 72, 153, 0.08); border: 1px solid rgba(236, 72, 153, 0.25); border-radius: 16px; padding: 16px 24px; display: inline-block; margin-bottom: 24px;">
                                        <div style="font-size: 10px; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Secure Admin OTP</div>
                                        <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 8px;">${otp}</span>
                                    </div>
                                    
                                    <p style="color: #71717A; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
                                        This OTP code is valid for exactly 10 minutes. If you did not initiate this super admin registration request, please secure your database credentials immediately.
                                    </p>

                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                        <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            });
        } catch (err) {
            console.error('Error sending admin verification email:', err);
        }
    }

    async sendAdminWelcomeCredentialsEmail(email, password, securityKey) {
        try {
            await this.transporter.sendMail({
                from: `"CreatorOS Admin Secure Core" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'CONFIRMED: Super Admin Identity Configured - CreatorOS AI',
                html: `
                    <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <tr>
                                <td>
                                    <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #e9d5ff; background: rgba(139, 92, 246, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                        SETUP CONFIRMED
                                    </div>
                                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Super Admin Configured</h1>
                                    <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                        Your Super Admin account has been successfully verified and activated! Below are your secure login credentials. Please save this email in a safe location.
                                    </p>
                                    
                                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 24px;">
                                        <div style="margin-bottom: 16px;">
                                            <div style="font-size: 10px; font-weight: 800; color: #a855f7; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">ADMIN EMAIL</div>
                                            <div style="font-size: 15px; font-weight: 700; color: #ffffff; font-family: monospace;">${email}</div>
                                        </div>
                                        <div style="margin-bottom: 16px;">
                                            <div style="font-size: 10px; font-weight: 800; color: #ec4899; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">PASSWORD</div>
                                            <div style="font-size: 15px; font-weight: 700; color: #ffffff; font-family: monospace;">${password}</div>
                                        </div>
                                        <div>
                                            <div style="font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">SECURITY KEY</div>
                                            <div style="font-size: 15px; font-weight: 700; color: #ffffff; font-family: monospace;">${securityKey}</div>
                                        </div>
                                    </div>
                                    
                                    <p style="color: #71717A; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
                                        <strong>IMPORTANT:</strong> For secure authentication, you must enter this exact Email, Password, and Security Key every time you log in to the administrative portal.
                                    </p>

                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                        <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            });
        } catch (err) {
            console.error('Error sending admin welcome email:', err);
        }
    }

    async sendPhoneOtpEmail(email, phone, otp) {
        try {
            await this.transporter.sendMail({
                from: `"CreatorOS AI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Phone Verification OTP - CreatorOS AI',
                html: `
                    <div style="background-color: #0A0A0C; padding: 60px 0; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <span style="display: none; font-size: 1px; color: #0A0A0C; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${Date.now()}</span>
                        
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #121214; border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                            <tr>
                                <td>
                                    <div style="display: inline-block; padding: 8px 16px; border: 1px solid rgba(236, 72, 153, 0.3); border-radius: 100px; font-size: 11px; font-weight: 800; color: #fbcfe8; background: rgba(236, 72, 153, 0.05); margin-bottom: 24px; letter-spacing: 1px; text-transform: uppercase;">
                                        PHONE VERIFICATION
                                    </div>
                                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0; letter-spacing: -0.5px;">Verify Your Phone</h1>
                                    <p style="color: #A0A0AB; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                                        Use the secure 6-digit OTP code below to verify your phone number <strong>${phone}</strong> and complete your account setup.
                                    </p>
                                    
                                    <div style="background: rgba(236, 72, 153, 0.08); border: 1px solid rgba(236, 72, 153, 0.25); border-radius: 16px; padding: 16px 24px; display: inline-block; margin-bottom: 24px;">
                                        <div style="font-size: 10px; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Phone OTP Code</div>
                                        <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 8px;">${otp}</span>
                                    </div>
                                    
                                    <p style="color: #71717A; font-size: 13.5px; line-height: 1.6; margin: 0 0 12px 0;">
                                        Enter this code in the "Phone OTP" field on the verification page. This code is valid for 10 minutes.
                                    </p>

                                    <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; margin-top: 24px; text-align: center;">
                                        <span style="color: #52525B; font-size: 11px;">&copy; 2026 CreatorOS AI. All rights reserved.</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            });
        } catch (err) {
            console.error('Error sending phone OTP email:', err);
        }
    }

    async sendSubscriptionSuccessEmail(email, name, planName) {
        try {
            await this.transporter.sendMail({
                from: `"CineFlow AI" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Payment Receipt - Welcome to Premium! 🎉',
                html: `
                    <div style="background-color: #F3F4F6; padding: 40px 20px; margin: 0; width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            
                            <!-- Header Area -->
                            <tr>
                                <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #E5E7EB;">
                                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                                        <span style="color: white; font-size: 30px; line-height: 60px; display: block;">✓</span>
                                    </div>
                                    <h1 style="color: #111827; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">Payment Successful</h1>
                                    <p style="color: #6B7280; font-size: 16px; margin: 0;">Thank you for upgrading to CineFlow Premium!</p>
                                </td>
                            </tr>

                            <!-- Body Area -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                                        Hi <strong>${name}</strong>,<br><br>
                                        We have successfully received your payment. Your workspace has been upgraded, and all premium features are now unlocked and ready to use.
                                    </p>

                                    <!-- Receipt Details Box -->
                                    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                        <h3 style="color: #111827; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 12px;">Order Summary</h3>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                                            <tr>
                                                <td style="color: #6B7280; font-size: 14px; padding-bottom: 8px;">Plan Purchased</td>
                                                <td style="color: #111827; font-size: 15px; font-weight: 600; text-align: right; padding-bottom: 8px;">${planName}</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #6B7280; font-size: 14px; padding-bottom: 8px;">Status</td>
                                                <td style="color: #10B981; font-size: 14px; font-weight: 700; text-align: right; padding-bottom: 8px;">Paid</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #6B7280; font-size: 14px; padding-bottom: 8px;">Date</td>
                                                <td style="color: #111827; font-size: 14px; font-weight: 500; text-align: right; padding-bottom: 8px;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <!-- Action Button -->
                                    <div style="text-align: center; margin-top: 32px; margin-bottom: 16px;">
                                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(90deg, #a855f7 0%, #ec4899 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-size: 16px; font-weight: 700; display: inline-block; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.25);">
                                            Access Your Dashboard
                                        </a>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer Area -->
                            <tr>
                                <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
                                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 12px 0;">
                                        If you have any questions about your subscription, please reply to this email or contact our support team.
                                    </p>
                                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                                        &copy; ${new Date().getFullYear()} CineFlow AI. All rights reserved.<br>
                                        This is an automated payment receipt.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </div>
                `
            });
        } catch (err) {
            console.error('Error sending subscription success email:', err);
        }
    }
}

module.exports = new EmailService();
