const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendTransactionConfirmation(buyerEmail, sellerEmail, productName, amount) {
  const buyerText = `Thank you for your purchase of ${productName} for ${amount} ETB. Your payment was successful.`;
  const sellerText = `Your product ${productName} has been sold for ${amount} ETB.`;

  await sendEmail(buyerEmail, 'Purchase Confirmation', buyerText);
  await sendEmail(sellerEmail, 'Sale Notification', sellerText);
}

export async function sendListingConfirmation(sellerEmail, productName) {
  const text = `Your listing for ${productName} has been posted successfully on Robe Market.`;
  await sendEmail(sellerEmail, 'Listing Confirmation', text);
}