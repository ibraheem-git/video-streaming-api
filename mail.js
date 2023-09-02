const nodemailer = require('nodemailer')


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const mailOptions = {
    from: process.env.EMAIL,
    to: "",
    subject: 'Sending Email using Node.js',
    text: "Hi Friend!"
};


const sendMail = (email, subject, body) => {
    const msg = transporter.sendMail({
        to: email,
        from: mailOptions.from,
        subject,
        text: body
    }, function(error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent:' + info.response)
        }
    })
    console.log(msg);
    return true;
}

module.exports = sendMail;