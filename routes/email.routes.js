const express = require('express');
const router = express.Router();
const { 
  sendEmail,
  getEmailHistory,
  deleteEmail,
  permanentDeleteEmail
} = require('../controllers/email.controllers');

router.post('/send', sendEmail);
router.get('/', getEmailHistory); // Use the controller version
router.delete('/:id', deleteEmail);
router.delete('/:id/permanent', permanentDeleteEmail);
router.get('/history', (req, res) => {
    const { status } = req.query;
    return getEmailHistory(req, res, status);
  });
  

module.exports = router;