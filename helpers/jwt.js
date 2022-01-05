const jwt = require('jsonwebtoken');
require('dotenv').config();
const pass = process.env.SECRET_JWT;
const timeExpires = 60*60*24;
// const timeExpires = process.env.EXPIRES_JWT;
const sign = (data,secrec = pass,expires = timeExpires)=>{
    return jwt.sign(data,secrec,{expiresIn:expires});
}

const verify = (token,secrec = pass)=>{
    jwt.verify(token,secrec,(error,decode)=>{
        if(error){
           result = error.name;
        }else{
            result = decode;
        }
    })
    return result;
}

module.exports = {
    sign,
    verify
}