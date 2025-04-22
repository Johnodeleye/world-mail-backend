const { sendCustomEmail } = require('../services/email.service');

const sendEmail = async (req, res) => {
  try {
    const { from, to, subject, body, upgradeLink } = req.body;
    
    if (!from || !to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "From, To, Subject and Body are required fields"
      });
    }

    const emailSent = await sendCustomEmail(from, to, subject, body, upgradeLink);

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: "Email sent successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email"
      });
    }
  } catch (error) {
    console.error("Error in sendEmail:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { sendEmail };