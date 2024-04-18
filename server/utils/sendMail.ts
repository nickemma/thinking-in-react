import nodemailer from 'nodemailer';

const sendMail = async (
  send_to: string | undefined,
  subject: string,
  message: string,
  send_from: string | undefined,
  reply_to: string
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 587,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      send_to,
      subject,
      message,
      send_from,
      replyTo: reply_to,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

export default sendMail;
