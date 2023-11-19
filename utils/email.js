const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // create a transportere

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD_EMAIL
    }
    // Active in gmail "less secure app" option//
  });
  // define the mail options
  const mailOptions = {
    from: 'Praveen <praveen@pkb.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
