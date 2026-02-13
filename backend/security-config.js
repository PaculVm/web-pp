// backend/security-config.js

const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const app = express();

// Enable CORS
app.use(cors());

// Use Helmet for secure HTTP headers
app.use(helmet());

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// Additional security headers
app.use(helmet({
    contentSecurityPolicy: false, // Adjust these values according to your needs
    referrerPolicy: { policy: "no-referrer" }
}));

module.exports = app;