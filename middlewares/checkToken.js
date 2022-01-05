const {verify} = require('./../helpers/jwt');

const checkToken = (req,res,next)=>{
    if(req.headers['chat_token'] != '' && Object.keys(req.body).length === 0){
        let token = req.headers['chat_token']
        let result = verify(token);
        if(result === 'JsonWebTokenError' || result === 'TokenExpiredError'){
            res.status(204).json();
        }else{
            res.status(200).json();
        }
    }else{
        if(Object.keys(req.body).length === 0){
            res.status(204).json();
        }else{
            next();
        }
    }
}

module.exports = {
    checkToken
}