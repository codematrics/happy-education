import nodemailer from "nodemailer";

export const sendMail = async (
  mailTemplate: string,
  text: string,
  subject: string,
  email: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: "Happy Education",
    to: email,
    subject,
    text,
    html: mailTemplate,
  });
};
