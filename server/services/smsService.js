class SMSService {
    async sendAdminPhoneOTP(phone, otp) {
        try {
            console.log('\n=============================================================');
            console.log(`📱 [SMS SERVICE] DISPATCHING SECURE SMS TO ${phone}`);
            console.log(`🔐 OTP SECURITY CODE: ${otp}`);
            console.log(`⏱️ VALID FOR: 10 MINUTES`);
            console.log('=============================================================\n');
            return true;
        } catch (err) {
            console.error('Error dispatching administrative SMS:', err);
            return false;
        }
    }

    async sendUserPhoneOTP(phone, otp) {
        try {
            console.log('\n=============================================================');
            console.log(`📱 [SMS SERVICE] USER PHONE VERIFICATION TO ${phone}`);
            console.log(`🔐 OTP CODE: ${otp}`);
            console.log(`⏱️ VALID FOR: 10 MINUTES`);
            console.log('=============================================================\n');
            return true;
        } catch (err) {
            console.error('Error dispatching user SMS:', err);
            return false;
        }
    }
}

module.exports = new SMSService();
