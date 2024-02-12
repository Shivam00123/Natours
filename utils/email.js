const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `shivamjackson6@gmail.com`;
    this.url = url;
    this.firstName = user.name.split(" ")[0];
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: convert(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours family!");
  }

  async sendOTP(OTP) {
    const html = pug.renderFile(`${__dirname}/../views/emails/verify_otp.pug`, {
      firstName: this.firstName,
      OTP,
      subject: "Verify OTP",
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Verify OTP",
      html,
      text: convert(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendPasswordReset() {
    await this.send(
      "resetPassword",
      "Your password reset token. (valid for only 10 minutes)"
    );
  }
};

//
