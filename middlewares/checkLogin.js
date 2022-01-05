
const checkLogin = (req,res,next)=>{
    if(Object.keys(req.body).length === 2){
        if(req.body.gmail != '' && req.body.password != ''){
            next();
        }else{
            res.status(400).json({data:'Vui lòng đừng để trống'});
        } 
    }else{
         res.status(400).json({data:'Dữ liệu gửi đi không hợp lệ'})
    }      
}

module.exports = {
    checkLogin
}