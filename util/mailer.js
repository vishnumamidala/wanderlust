const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendBookingConfirmation(email, booking) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Booking Confirmed 🎉",
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Listing: ${booking.listing.title}</p>
      <p>Total Paid: ₹${booking.totalPrice}</p>
    `
  });
}

module.exports = { sendBookingConfirmation };
