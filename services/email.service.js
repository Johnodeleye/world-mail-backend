const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendCustomEmail = async (from, to, subject, body, ctas = [], senderInfo = {}, bcc = [], attachments = []) => {
  try {
    // Get credentials from database
    const emailSettings = await prisma.emailSettings.findFirst();
    
    if (!emailSettings) {
      throw new Error('Email credentials not configured in database');
    }

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailSettings.emailUser,
        pass: emailSettings.emailPass,
      },
      tls: {
        rejectUnauthorized: true
      }
    });

    // Ensure body is a string
    const emailBody = typeof body === 'string' ? body : JSON.stringify(body);
    const htmlBody = emailBody.replace(/\n/g, '<br>');
      
    // Prepare attachments
const emailAttachments = attachments.map(attachment => {
  const attachmentData = {
    filename: attachment.name,
    content: attachment.content,
    encoding: 'base64',
    contentType: attachment.type
  };

  // For images, use the CID from frontend if available
  if (attachment.type.startsWith('image/') && attachment.cid) {
    attachmentData.cid = attachment.cid;
    attachmentData.contentDisposition = 'inline';
  }

  return attachmentData;
});

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background: #ffffff;
          color: #0d404f;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background: #0d404f;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px;
          color: #0d404f;
        }
        .cta-button {
          display: inline-block;
          background: #ff795f;
          color: #ffffff !important;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          margin: 10px 5px;
        }
        .contact-info {
          padding: 20px;
          background: #f6f6f6;
          border-top: 1px solid #ccc;
          color: #7c7b79;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #7c7b79;
          padding: 20px 0;
          border-top: 1px solid #ccc;
        }
        .footer a {
          color: #7c7b79;
          text-decoration: none;
          margin: 0 8px;
        }
        .attachments {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .attachment-item {
          display: flex;
          align-items: center;
          padding: 8px;
          margin: 5px 0;
          background: white;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .attachment-icon {
          margin-right: 10px;
          font-size: 24px;
        }
        .attachment-info {
          flex: 1;
        }
        .attachment-name {
          font-weight: 500;
          word-break: break-word;
        }
        .attachment-type {
          font-size: 12px;
          color: #666;
        }
        .inline-image {
          max-width: 100%;
          height: auto;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://www.rtnewworld.com/wp-content/uploads/2025/02/cropped-Brown-Beige-Tree-Business-Fundation-Logo-e1740757016443.png" 
               alt="RT New World Logo" 
               class="logo">
        </div>
  
        <div class="content">
          ${htmlBody}
  
          <div style="text-align: center; margin: 30px 0;">
            ${ctas.map(cta => `
              <a href="${cta.link}" class="cta-button">
                ${cta.text}
              </a>
            `).join('')}
          </div>
        </div>

${attachments.map(attachment => {
  if (attachment.type.startsWith('image/') && attachment.cid) {
    return `
      <div>
        <img src="cid:${attachment.cid}" 
             alt="${attachment.name}" 
             class="inline-image"
             style="display: block; max-width: 100%; height: auto;">
        <div class="attachment-name">
          ${attachment.name} 
          <a href="cid:${attachment.cid}" 
             download="${attachment.name}"
             style="color: #0d404f; margin-left: 8px;">(Download)</a>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="attachment-item">
        <div class="attachment-icon">${getFileIcon(attachment.type)}</div>
        <div class="attachment-info">
          <div class="attachment-name">${attachment.name}</div>
          <div class="attachment-type">${attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}</div>
        </div>
      </div>
    `;
  }
}).join('')}
  
        <div class="contact-info">
          <h3 style="margin: 0 0 10px 0; font-size: 16px;">Contact Information:</h3>
          <p style="margin: 5px 0; font-size: 14px;">
            ${senderInfo.name || 'RT New World Team'}${senderInfo.position ? ' - ' + senderInfo.position : ''}<br>
            ${senderInfo.email ? `Email: <a href="mailto:${senderInfo.email}" style="color: #0d404f;">${senderInfo.email}</a><br>` : ''}
            ${senderInfo.phone ? `Phone: ${senderInfo.phone}` : ''}
          </p>
        </div>
  
        <div class="footer">
          <p>© ${new Date().getFullYear()} RT New World. All rights reserved.</p>
          <p>
            <a href="https://www.rtnewworld.com/privacy">Privacy</a>
            <a href="https://www.rtnewworld.com/terms">Terms</a>
            <a href="mailto:info@rtnewworld.com">Contact</a>
          </p>
          <p><a href="https://www.rtnewworld.com/unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    const textContent = `${body}\n\n${
      ctas.map(cta => `${cta.text}: ${cta.link}`).join('\n')
    }\n\n${
      senderInfo.name ? `Contact: ${senderInfo.name}` : ''
    }${
      senderInfo.position ? ` (${senderInfo.position})` : ''
    }${
      senderInfo.email ? `\nEmail: ${senderInfo.email}` : ''
    }${
      senderInfo.phone ? `\nPhone: ${senderInfo.phone}` : ''
    }${
      attachments.length > 0 ? `\n\nAttachments (${attachments.length}):\n${
        attachments.map(a => `- ${a.name}`).join('\n')
      }` : ''
    }`;

    let info = await transporter.sendMail({
      from: `"${senderInfo.name || 'RT New World'}" <${from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      bcc: Array.isArray(bcc) && bcc.length > 0 ? bcc.join(', ') : undefined,
      subject: subject,
      html: htmlContent,
      text: textContent,
      attachments: emailAttachments,
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@rtnewworld.com>, <https://www.rtnewworld.com/unsubscribe>',
        'X-Mailer': 'RT New World Mail Service',
        'X-Priority': '1',
        'X-MSMail-Priority': 'High'
      }
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
};

function getFileIcon(mimeType) {
  const icons = {
    // Images
    'image/jpeg': '🖼️', // or use '📷'
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/svg+xml': '🖼️',
    'image/webp': '🖼️',
    
    // Documents
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'application/vnd.ms-powerpoint': '📑',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📑',
    
    // Archives
    'application/zip': '🗜️',
    'application/x-zip-compressed': '🗜️',
    'application/x-rar-compressed': '🗜️',
    'application/x-7z-compressed': '🗜️',
    
    // Text files
    'text/plain': '📄',
    'text/csv': '📊',
    
    // Audio/Video
    'audio/mpeg': '🎵',
    'video/mp4': '🎬',
  };
  
  return icons[mimeType] || '📁'; // Default icon for unknown types
}

module.exports = { sendCustomEmail };