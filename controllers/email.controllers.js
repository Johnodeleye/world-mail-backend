const { PrismaClient } = require('@prisma/client');
const { sendCustomEmail } = require('../services/email.service');
const prisma = new PrismaClient();

const sendEmail = async (req, res) => {
  try {
    const { from, to, bcc, subject, body, ctas = [], senderInfo = {}, attachments = [] } = req.body;
    
    // Validate required fields
    if (!from || !to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: "From, To, Subject and Body are required fields"
      });
    }

    // Ensure body is a string
    const emailBody = typeof body === 'string' ? body : JSON.stringify(body);

    // Send email using your existing service
    const result = await sendCustomEmail(from, to, subject, emailBody, ctas, senderInfo, bcc, attachments);

    // Store in database (without BCC as requested)
    const emailRecord = await prisma.email.create({
      data: {
        from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        body: emailBody,
        htmlBody: emailBody.replace(/\n/g, '<br>'),
        ctas: ctas.length > 0 ? JSON.stringify(ctas) : null,
        senderInfo: senderInfo ? JSON.stringify(senderInfo) : null,
        messageId: result.messageId || null
      }
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
        emailId: emailRecord.id
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: result.error,
        emailId: emailRecord.id
      });
    }
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};

// Get email history
const getEmailHistory = async (req, res, status) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
  
      const where = {};
      if (status) {
        where.status = status;
      }
  
      const emails = await prisma.email.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          from: true,
          to: true,
          subject: true,
          createdAt: true,
          updatedAt: true,
          messageId: true,
          status: true
        }
      });
  
      const total = await prisma.email.count({ where });
  
      return res.json({
        success: true,
        data: emails.map(email => ({
          ...email,
          to: email.to.includes(',') ? email.to.split(',') : [email.to]
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error getting email history:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    } finally {
      await prisma.$disconnect();
    }
  };

// Delete email
const deleteEmail = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Instead of deleting, update status to 'trash'
      await prisma.email.update({
        where: { id: parseInt(id) },
        data: { status: 'trash' }
      });
  
      return res.json({
        success: true,
        message: "Email moved to trash successfully"
      });
    } catch (error) {
      console.error("Error moving email to trash:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to move email to trash",
        error: error.message
      });
    } finally {
      await prisma.$disconnect();
    }
  };


  const permanentDeleteEmail = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate the ID is provided and is a number
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid email ID provided"
        });
      }
  
      // Permanently delete the email from database
      await prisma.email.delete({
        where: { 
          id: parseInt(id) // Ensure we parse to integer
        }
      });
  
      return res.json({
        success: true,
        message: "Email permanently deleted successfully"
      });
    } catch (error) {
      console.error("Error permanently deleting email:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to permanently delete email",
        error: error.message
      });
    } finally {
      await prisma.$disconnect();
    }
  };

  // email.controllers.js
const updateEmailCredentials = async (req, res) => {
  try {
    const { emailUser, emailPass } = req.body;

    if (!emailUser || !emailPass) {
      return res.status(400).json({
        success: false,
        message: "Email user and password are required"
      });
    }

    // Check if settings already exist
    const existingSettings = await prisma.emailSettings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing
      settings = await prisma.emailSettings.update({
        where: { id: existingSettings.id },
        data: { emailUser, emailPass }
      });
    } else {
      // Create new
      settings = await prisma.emailSettings.create({
        data: { emailUser, emailPass }
      });
    }

    return res.json({
      success: true,
      message: "Email credentials updated successfully",
      settings: {
        id: settings.id,
        emailUser: settings.emailUser,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating email credentials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update email credentials",
      error: error.message
    });
  }
};

const getEmailCredentials = async (req, res) => {
  try {
    const settings = await prisma.emailSettings.findFirst();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Email credentials not configured"
      });
    }

    return res.json({
      success: true,
      settings: {
        id: settings.id,
        emailUser: settings.emailUser,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error("Error getting email credentials:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get email credentials",
      error: error.message
    });
  }
};
  
  module.exports = { 
    sendEmail,
    getEmailHistory,
    deleteEmail,
    permanentDeleteEmail,
    updateEmailCredentials,
    getEmailCredentials
  };