// security-improvements.js

// Middleware and utility functions for security enhancements

// 1. Helmet setup
const helmet = require('helmet');

const setupHelmet = (app) => {
    app.use(helmet()); // Secures Express apps by setting various HTTP headers
};

// 2. CORS configuration
const cors = require('cors');

const setupCORS = (app) => {
    const corsOptions = {
        origin: 'https://example.com', // Update with your client URL
        optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions)); // Enables CORS with specified options
};

// 3. CSRF protection
const csrf = require('csurf');

const setupCSRFProtection = (app) => {
    const csrfProtection = csrf({ cookie: true });
    app.use(csrfProtection); // Adds CSRF protection
};

// 4. Security headers
const setupSecurityHeaders = (app) => {
    // Add additional security headers
    app.use((req, res, next) => {
        res.header("X-Content-Type-Options", "nosniff");
        res.header("X-Frame-Options", "DENY");
        res.header("X-XSS-Protection", "1; mode=block");
        next();
    });
};

// 5. Password validation
const validatePassword = (password) => {
    // Minimum 8 characters, 1 uppercase, 1 lowercase, 1 numeric
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
};

// 6. HTTPS enforcement
const enforceHTTPS = (req, res, next) => {
    if (req.secure) {
        return next(); // Proceed if HTTPS
    } else {
        res.redirect(`https://${req.headers.host}${req.url}`); // Redirect to HTTPS
    }
};

module.exports = {
    setupHelmet,
    setupCORS,
    setupCSRFProtection,
    setupSecurityHeaders,
    validatePassword,
    enforceHTTPS,
};
