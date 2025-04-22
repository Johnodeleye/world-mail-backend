const express = require('express');
const router = express.Router();
const { sendEmail } = require('../controllers/email.controllers');

router.post('/send-email', sendEmail);

module.exports = router;