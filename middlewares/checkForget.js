const {findUser} = require('./../models/users');

const checkForget = (req,res,next)=>{
    if(req.body.gmail || req.body.gmail === ''|| req.body.password === ''){
        findUser(req.body.gmail)
            .then(re=>{
                if(re === 204){
                    console.log(204)
                    res.status(204).json({data:'Tài khoảng không tồn tại'})
                }else{
                    next();
                }
            })
            .catch(err=>{
                console.log('checkregister',err)
                res.status(500).json('Server Error')
            })
    }else{
        res.status(400).json({data:'kiểm tra lại dữ liệu gửi'})
    }
}

module.exports = {
    checkForget
}