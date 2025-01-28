const nodemailer = require("nodemailer");

// Configure and export the transporter
const transporter = nodemailer.createTransport({
	service: "gmail", // Or another email service
	auth: {
		user: process.env.EMAIL_USER, // Your email address
		pass: process.env.EMAIL_PASS, // Your email password or app-specific password
	},
});

// Export the transporter
module.exports = transporter;
