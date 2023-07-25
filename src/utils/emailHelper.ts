import * as nodemailer from 'nodemailer';

export default async function sendEmail(
    title: string,
    body: string,
    cc: string,
    recipient: string,
) {
    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    // Configure the email message
    const message = {
        from: 'your-email@gmail.com',
        to: recipient,
        cc: cc,
        subject: title,
        text: body,
    };

    // Send the email
    const info = await transporter.sendMail(message);

    console.log(`Email sent: ${info.messageId}`);
}
