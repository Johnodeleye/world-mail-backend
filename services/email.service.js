const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 587,
  auth: {
    user: 'resend',
    pass: 're_AtdEiTSX_J1hxqSSnKBpKT8oyHJqmxQkJ',
  },
});

const sendCustomEmail = async (from, to, subject, body, upgradeLink = '') => {
  try {
    const styledBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background-color: #4a6bff; 
          padding: 20px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .header h1 { 
          color: white; 
          margin: 0; 
          font-size: 24px;
        }
        .content { 
          padding: 30px; 
          background-color: #f9f9f9; 
          border-radius: 0 0 8px 8px; 
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #4a6bff; 
          color: white; 
          text-decoration: none; 
          border-radius: 4px; 
          font-weight: bold; 
          margin: 20px 0; 
        }
        .footer { 
          margin-top: 30px; 
          font-size: 12px; 
          text-align: center; 
          color: #777; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${subject}</h1>
      </div>
      <div class="content">
        ${body.replace(/\n/g, '<br>')}
        
        ${upgradeLink ? `
        <center>
          <a href="${upgradeLink}" class="button">Upgrade Now</a>
        </center>
        ` : ''}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: styledBody,
    });

    console.log(`Email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendCustomEmail };