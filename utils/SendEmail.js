const nodemailer = require("nodemailer");


//Creating nodemailer transporter
 const  sendEmail = async (options)=>{


    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            username: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    //defining mail options

    const mailOptions = {
        from: process.env.MAIN_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message

    }
        //final mail sending function.
    await transporter.sendMail(mailOptions);

}
module.exports=sendEmail();

