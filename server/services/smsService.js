class SMSService {
    async sendAdminPhoneOTP(phone, otp) {
        try {





            return true;
        } catch (err) {
            console.error('Error dispatching administrative SMS:', err);
            return false;
        }
    }

    async sendUserPhoneOTP(phone, otp) {
        try {





            return true;
        } catch (err) {
            console.error('Error dispatching user SMS:', err);
            return false;
        }
    }
}

module.exports = new SMSService();
