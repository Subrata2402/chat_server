const nodemailer = require("nodemailer");

const sendMail = async (senderId, receiverId, subject, content) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: senderId + " <" + process.env.EMAIL_HOST + ">",
      to: receiverId,
      subject: subject,
      html: content,
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendMail;