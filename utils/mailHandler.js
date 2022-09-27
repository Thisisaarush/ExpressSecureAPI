const nodemailer = require("nodemailer");

exports.mailHandler = async (passwordResetUrl, email) => {
  var transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_HOST,
    port: process.env.MAIL_TRAP_PORT,
    auth: {
      user: process.env.MAIL_TRAP_USER,
      pass: process.env.MAIL_TRAP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"AarushAdmin" <at@gmail.com>',
    to: `${email}`,
    subject: "Password Reset",
    text: "Please use this link to reset your password",
    html: `<a href=${passwordResetUrl}>Reset Your Password</a>`,
  });
};
