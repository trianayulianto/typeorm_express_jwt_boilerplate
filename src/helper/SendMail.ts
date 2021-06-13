import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';

dotenv.config();

const smtpOptions = {
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
};

const sendMail = async ({
  to, subject, html, from = process.env.MAIL_FROM,
}) => {
  const transport = nodemailer.createTransport(smtpOptions);

  await transport.sendMail({
    from, to, subject, html,
  });
};

export default sendMail;
