// email.routes.js
const express = require('express');
const router = express.Router();
const { 
  sendEmail,
  getEmailHistory,
  deleteEmail,
  permanentDeleteEmail,
  updateEmailCredentials,
  getEmailCredentials
} = require('../controllers/email.controllers');

router.post('/send', sendEmail);
router.get('/', getEmailHistory);
router.delete('/:id', deleteEmail);
router.delete('/:id/permanent', permanentDeleteEmail);
router.get('/history', (req, res) => {
  const { status } = req.query;
  return getEmailHistory(req, res, status);
});


router.put('/credentials', updateEmailCredentials);
router.get('/credentials', getEmailCredentials);

module.exports = router;