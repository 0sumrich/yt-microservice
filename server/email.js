const nodemailer = require("nodemailer");
const {promisify} = require('util')
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.FROM,
		pass: process.env.EM_PW,
	},
});

async function sendMail(options) {
	const { fromEmail, toEmail, subject, text, html } = options;
	const mailOptions = {
		from: fromEmail ? fromEmail : process.env.FROM, // sender address
		to: toEmail ? toEmail : process.env.TO, // list of receivers
		subject, // Subject line
		// text,
		html
	};
	try {
		const info = await transporter.sendMail(mailOptions)	
		return info
	}catch(e){
		console.log(e)
		debugger;
	}
	
	
}

module.exports = sendMail
