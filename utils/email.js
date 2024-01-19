const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //create transporter
  var transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  //define email options

  const mailOptions = {
    from: "Shivam Rawat <shivam@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send mail
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
