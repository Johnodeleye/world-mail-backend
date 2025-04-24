const nodemailer = require('nodemailer');

const sendCustomEmail = async (from, to, subject, body, ctas = [], senderInfo = {}) => {
    try {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: true
        }
      });
  
      // Convert body text to HTML with line breaks
      const htmlBody = body.replace(/\n/g, '<br>');
      
      // Generate CTA buttons
      let ctaButtons = '';
      ctas.forEach(cta => {
        ctaButtons += `
          <a href="${cta.link}" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; 
                    margin: 10px 5px;">
            ${cta.text}
          </a>
        `;
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
      }`;
  
      let info = await transporter.sendMail({
        from: `"${senderInfo.name || 'RT New World'}" <${from}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: htmlContent,
        text: textContent,
        // Add headers to improve deliverability
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
    }
  };

module.exports = { sendCustomEmail };