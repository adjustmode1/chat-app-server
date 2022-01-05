const {findUser} = require('./../models/users');

const checkRegister = (req,res,next)=>{
    if(req.body.gmail != ''){
        findUser(req.body.gmail)
            .then(re=>{
                if(re === 200){
                    res.status(204).json({data:'Gmail đã được sử dụng'})
                }else{
                    next();
                }
            })
            .catch(err=>{
                console.log('checkregister',err)
                res.status(500).json('Server Error')
            })
    }
}

module.exports = {
    checkRegister
}