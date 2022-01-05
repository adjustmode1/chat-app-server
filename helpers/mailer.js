"use strict";
const mailer = require('nodemailer');

const send_mail = (to,subject,data)=>{
    let host = mailer.createTransport({
        host:'smtp.gmail.com',
        auth:{
            user:'nienluancntt1@gmail.com',
            pass:'Nienluan@1gmailcom'
        }
    })

    return host.sendMail({
        from: '"Chat App" <nienluancntt1@gmail.com>',
        to,
        subject,
        text:'xác thực',
        html:`code: ${data}`
    })
}

module.exports = {
    send_mail
}