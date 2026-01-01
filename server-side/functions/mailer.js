const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'surajfirebaseapp@gmail.com',
    pass: 'pvnzbfzlekvtdwgf'
  }
});

const sendEmail = async (to, subject, text, htmlBody = null) => {
  try {
    const mailOptions = {
      from: '"IT Support" surajfirebaseapp@gmail.com',
      to: to,                                      
      subject: subject,                             
      text: text,                                   
      html: htmlBody                               
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;