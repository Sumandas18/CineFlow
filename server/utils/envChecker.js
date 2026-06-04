const fs = require('fs');

const checkEnvVariables = () => {
    // Required critical environment variables
    const requiredVars = {
        MONGODB_URL: 'MongoDB Connection String',
        JWT_SECRET: 'JWT Authentication Secret',
        GEMINI_API_KEY: 'Google Gemini API Key',
        CLOUDINARY_CLOUD_NAME: 'Cloudinary Cloud Name',
        CLOUDINARY_API_KEY: 'Cloudinary API Key',
        CLOUDINARY_API_SECRET: 'Cloudinary API Secret'
    };

    // Optional environment variables with fallback/warnings
    const optionalVars = {
        REDIS_URL: 'Redis Queue URL',
        RAZORPAY_KEY_ID: 'Razorpay Key ID',
        EMAIL_USER: 'Email Service User'
    };

    let hasCriticalError = false;

    // ANSI escape codes for coloring
    const colors = {
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        cyan: '\x1b[36m',
        reset: '\x1b[0m'
    };

    console.log(`\n${colors.cyan}==========================================`);
    console.log(`      CREATOR OS AI - ENVIRONMENT CHECK   `);
    console.log(`==========================================${colors.reset}\n`);

    // Check required variables
    for (const [key, name] of Object.entries(requiredVars)) {
        if (!process.env[key] || process.env[key].trim() === '') {
            console.log(`${colors.red}✗ Missing Critical: ${name} (${key})${colors.reset}`);
            hasCriticalError = true;
        } else {
            console.log(`${colors.green}✓ ${name} Ready${colors.reset}`);
        }
    }

    // Check optional variables
    for (const [key, name] of Object.entries(optionalVars)) {
        if (!process.env[key] || process.env[key].trim() === '') {
            console.log(`${colors.yellow}⚠ Missing Optional: ${name} (${key})${colors.reset}`);
        } else {
            console.log(`${colors.green}✓ ${name} Ready${colors.reset}`);
        }
    }

    console.log(`\n${colors.cyan}==========================================${colors.reset}\n`);

    if (hasCriticalError) {
        console.error(`${colors.red}[FATAL] Critical environment variables are missing. Please check your .env file.${colors.reset}`);
        console.error(`${colors.yellow}Tip: Copy .env.example to .env and fill in the values.${colors.reset}\n`);
        process.exit(1); // Stop server startup
    }
};

module.exports = checkEnvVariables;
