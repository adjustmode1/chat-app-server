//delete affter public
require('dotenv').config();

const express = require('express');
const app = express();

const http = require('http');
const server = http.Server(app);
const cors = require('cors');
const io = require('socket.io')(server,{
    cors:{
        origin:'*'
    }
});

//installed
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookiParser = require('cookie-parser');

//variable
const port = process.env.PORT;
const pass = process.env.SECRET_SESSION;


//use middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors());
app.use(cookiParser('pass'))
app.use(session({
    secret:pass,
    resave:true,
    saveUninitialized:true,
    cookie:{secure:false,maxAge:120000}
}))

//models
const {listUsers,checkUser,addUser,changePass,findUserToAddFriend, findUser,updateUser} = require('./models/users');
const {listFriends,changeNameFriend,findFriend,blockFriend,unBlockFriend} = require('./models/friends');
const {listRequestFriend,listAcceptFriend,deleteRequestFriend,updateRequestFriend,findRequestFriend,findAcceptFriend,addRequestFriend} = require('./models/request_friends');
const {listGroups,changeNameGroup,deleteGroup,deleteGroupFriend,createGroup,findGroup,leaveGroup,kickOutGroup} = require('./models/groups');
const {listMesageFriend,listMesageGroup,listMessages,sendMesages,deleteAllMessages,cancelMessages} = require('./models/messages');
const {listMembers,addMember,checkRule,grantPermission} = require('./models/group_detail');

//components
const {send_mail} = require('./helpers/mailer');
const {sign,verify} = require('./helpers/jwt');
//middleware
const {checkLogin} = require('./middlewares/checkLogin');
const {checkToken} = require('./middlewares/checkToken');
const {checkRegister} = require('./middlewares/checkRegister');
const {checkForget} = require('./middlewares/checkForget');


app.get('/',listUsers);
app.post('/login',checkToken,checkLogin,(req,res)=>{
    checkUser(req.body.gmail,req.body.password)
        .then(rel=>{
            if(rel.status === 200){
                let code = sign({gmail:req.body.gmail});
                let d = new Date(rel.data[0].birthday);
                let day = (d.getDate())<10? "0"+d.getDate():(d.getDate());
                let month = (d.getMonth()+1)<10? "0"+(d.getMonth()+1):(d.getMonth()+1);
                let birthday = d.getFullYear()+'-'+month+'-'+day;
                res.status(200).json({
                    code,
                    data:{
                        gmail:rel.data[0].gmail,
                        name:rel.data[0].name,
                        birthday,
                        address:rel.data[0].address,
                        phone_number:rel.data[0].phone_number,
                        sex:rel.data[0].sex
                    }
                });
            }else{
                res.status(203).json({data:'no'});
            }
        })
        .catch(err=>{
            res.status(500).json({data:'Server Error'})
        })
});

const keys = (obj) =>{
    return Object.keys(obj).length;
}

app.post('/register',checkRegister,(req,res)=>{
    if(keys(req.body) === 6){
        if(req.body.gmail != '' && req.body.password != ''&& req.body.name != ''&& req.body.birthday != ''&& req.body.address != ''&& req.body.phone != ''){
            let code = Math.random().toString().substr(2,8);
            send_mail(req.body.gmail,'MÃ XÁC NHẬN ĐĂNG KÝ',code)
                .then(re=>{
                    res.status(200).json({data:req.sessionID})
                    req.session.code_register = code;
                    req.session.register = {
                        gmail:req.body.gmail,
                        password:req.body.password,
                        name:req.body.name,
                        birthday: req.body.birthday,
                        address:req.body.address,
                        phone:req.body.phone
                    }
                    req.session.save((err)=>{})
                })
                .catch(err=>{
                    res.status(207).json({data:'mail không hợp lệ'})
                })   
        }else{
            res.status(204).json({data:'empty'});
        }
    }else{
        res.status(204).json({data:'no content'})
    }
})

app.post('/forget',checkForget,(req,res)=>{
    let code = Math.random().toString().substr(2,8);
    send_mail(req.body.gmail,'MÃ XÁC NHẬN ĐỔI MẬT KHẨU',code)
        .then(re=>{
            res.status(200).json({data:req.sessionID})
            req.session.code_forget = code;
            req.session.forget = {
                gmail:req.body.gmail,
                password: req.body.password
            }
            req.session.save((err)=>{})
        })
        .catch(err=>{
            res.status(207).json({data:'Mail không hợp lệ'})
        })     
})

app.post('/accept',(req,res)=>{
    if(req.headers['chat_session'] && req.headers.chat_session != ''){
        let id = req.headers['chat_session'];
        let session = JSON.parse(req.sessionStore.sessions[id]);
        if(session.code_register){
            if(req.body.code && req.body.code != ''){
                if(req.body.code === session.code_register){
                    addUser(session.register.gmail,session.register.password,session.register.name,session.register.birthday,session.register.address,session.register.phone)
                        .then(rel=>{
                            if(rel === 200){
                                res.status(200).json({data:'thêm thành công'})
                            }else{
                                res.status(rel).json({data:'Thêm không thành công'});
                            }
                        })
                        .catch(err=>{
                            res.status(500).json({data:'server error'})
                        })
                }else{
                    res.status(209).json({data:'Mã xác nhận sai'})
                }
            }else{
                res.status(400).json({data:'no content'});
            }
        }else{
            if(session.code_forget){
                if(session.code_forget === req.body.code){
                    changePass(session.forget.gmail,session.forget.password)
                        .then(rel=>{
                            if(rel === 200){
                                res.status(200).json({data:'Cập nhật thành công'});
                            }else{
                                res.status(204).json({data:'Lỗi dữ liệu vui lòng thực hiện lại'})
                            }
                        })
                        .catch(err=>{
                            res.status(500).json({data:'Server Error'});
                        })
                }else{
                    res.status(209).json({data:'Mã xác nhận không chính xác'})
                }
            }
        }      
    }
})

io.on('connection',(socket)=>{
    console.log(`đã có kết nối từ client id: ${socket.id}`);
    socket.on('disconnect',()=>{
        console.log(`${socket.id}: đã ngắt kết nối tới server`);
    })
    socket.on('hello',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            socket.emit('server_hello',"chào");
            socket.join(auth.gmail);
            listGroups(auth.gmail)
            .then(re=>{
                if(re.count>0){
                    re.result.map(el=>{
                        socket.join(el.id_group);
                    })
                }
            })
            listFriends(auth.gmail)
            .then(re=>{
                if(re.count>0){
                    re.result.map(el=>{
                        socket.join(el.id_group);
                    })
                }
            })
            .catch(err=>{
                
            })
            console.log("server join: "+auth.gmail);
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('list friend',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listFriends(auth.gmail)
                .then(re=>{
                    socket.emit('server list friend',re.result);
                })
                .catch(err=>{
                    
                })

        }else{
            socket.emit('no auth')
        }
    })
    socket.on('update info',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            updateUser(auth.gmail,data)
            .then(re=>{
                socket.emit('server update info',data);
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('list group',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listGroups(auth.gmail)
                .then(re=>{
                    socket.emit('server list group',re.result);
                })
                .catch(err=>{
                    
                })
        }else{
            socket.emit('no auth')
        }        
    })
    socket.on('list message',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            let friend = [];
            listMesageFriend(auth.gmail)
                .then(re=>{
                    re.result.map((el,index)=>{
                        el.isgroup = false;
                        friend.push(el)
                    })
                    listMesageGroup(auth.gmail)
                    .then(rel=>{
                        rel.result.map((el,index)=>{
                            el.isgroup = true;
                            friend.push(el);
                        })
                        socket.emit('server list message',friend);
                    })
                    .catch(err=>{
                        
                    })
                })
                .catch(err=>{
                    
                })
        }else{
            socket.emit('no auth')
        }        
    })
    socket.on('list member',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listMembers(data)
                .then(re=>{
                    socket.emit('server list member',re.result);
                })
                .catch(err=>{
                    console.log(err)
                })
        }else{
            socket.emit('no auth')
        }        
    })
    socket.on('change name friend',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            changeNameFriend(auth.gmail,data.gmail,data.name)
                .then(re=>{
                    socket.emit('server change name friend',re.count);
                })
                .catch(err=>{
                    console.log(err)
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('change name group',(data)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            changeNameGroup(auth.gmail,data.room,data.name)
                .then(re=>{
                    socket.emit('server change name group',1);
                })
                .catch(err=>{
                    console.log(err)
                    socket.emit('server change name group',0);
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('find user to add friend',async (gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            let rule = 1;
            switch (rule) {
                case 1:
                    await findFriend(auth.gmail,gmail)
                        .then(re=>{
                            if(re.count != 0){
                                socket.emit('server find user to add friend',{rule:1,friend:re.result[0]});
                                rule = -1;
                            }else{
                                rule = 2;
                            }
                        })
                        if(rule===-1){
                            return;
                        }
                case 2:
                    await findRequestFriend(auth.gmail,gmail)
                    .then(re=>{
                        if(re.count != 0){
                            socket.emit('server find user to add friend',{rule:2,friend:re.result[0]});
                            rule = -1;
                        }else{
                            rule = 3;
                        }
                    })
                    if(rule===-1){
                        return;
                    }
                case 3:
                    await findAcceptFriend(auth.gmail,gmail)
                    .then(re=>{
                        if(re.count != 0){
                            socket.emit('server find user to add friend',{rule:3,friend:re.result[0]});
                            rule = -1;
                        }else{
                            rule = 4;
                        }
                    }) 
                    if(rule===-1){
                        return;
                    }
                case 4:
                    await findUserToAddFriend(auth.gmail,gmail)
                        .then(re=>{
                            if(re.count != 0){
                                socket.emit('server find user to add friend',{rule:0,friend:re.result[0]});
                                rule = -1;
                            }else{
                                rule = 5;
                            }
                        })
                        if(rule===-1){
                            return;
                        }
                case 5:
                    return socket.emit('server find user to add friend',{rule:-1,friend:null});
            }
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('list request friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listRequestFriend(auth.gmail)
                .then(re=>{
                    if(re.count!==0){
                        socket.emit('server list request friend',re);
                    }
                })
                .catch(err=>{
                    console.log(err)
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('list accept friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listAcceptFriend(auth.gmail)
                .then(re=>{
                    if(re.count!==0){
                        socket.emit('server list accept friend',re);
                    }
                })
                .catch(err=>{
                    console.log(err)
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('cancel request add friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            deleteRequestFriend(auth.gmail,gmail)
                .then(re=>{
                    io.to(gmail).emit('server cancel request add friend',{type:"accept",gmail:auth.gmail});
                    socket.emit('server cancel request add friend',{type:"request",gmail:gmail});
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('cancel accept add friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            deleteRequestFriend(gmail,auth.gmail)
                .then(re=>{
                    if(re.count>0){
                        io.to(gmail).emit('server cancel accept add friend',{type:"request",gmail:auth.gmail});
                        socket.emit('server cancel accept add friend',{type:"accept",gmail:gmail});
                    }
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('accept add friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            updateRequestFriend(gmail,auth.gmail)
                .then(re=>{
                    findFriend(auth.gmail,gmail)
                        .then(rel=>{
                            if(rel.count!==0){
                                io.to(gmail).emit('server accept add friend',{type:"request",friend:rel.result[0]});
                            }
                        })
                    findFriend(auth.gmail,gmail)
                        .then(rel=>{
                            if(rel.count!==0){
                                socket.emit('server accept add friend',{type:"accept",friend:rel.result[0]});
                            }
                        })
                })   
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('request add friend',(gmail)=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            addRequestFriend(auth.gmail,gmail)
                .then(async (rel)=>{
                    if(rel.count!==0){
                        let owner = "";
                        let friend = "";
                        await findUserToAddFriend(auth.gmail,gmail)
                                .then(re=>{
                                    owner = re.result[0];
                                })
                        await findUserToAddFriend(gmail,auth.gmail)
                                .then(re=>{
                                    friend = re.result[0];
                                })
                        if(owner !== "" && friend !== ""){
                            io.to(gmail).emit('server request add friend',{type:"accept",user:friend});
                            socket.emit('server request add friend',{type:"request",user:owner})
                        }else{
                            io.to(gmail).emit('server request add friend',{type:"error",user:friend});
                            socket.emit('server request add friend',{type:"error",user:owner})
                        }
                    }
                })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('block friend',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            blockFriend(auth.gmail,data.gmail)
            .then(re=>{
                if(re.count>0){
                    socket.emit('server block friend',data.gmail);
                }else{
                    socket.emit('server block friend','');
                }
            })
            .catch(err=>{
                console.log(err)
                socket.emit('server block friend','error');
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('unblock friend',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            unBlockFriend(auth.gmail,data.gmail)
            .then(re=>{
                if(re.count>0){
                    socket.emit('server unblock friend',data.gmail);
                }else{
                    socket.emit('server unblock friend','');
                }
            })
            .catch(err=>{
                console.log(err)
                socket.emit('server unblock friend','error');
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('delete friend',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            findFriend(auth.gmail,data)
            .then(re=>{
                if(re.count>0){
                    if(re.result[0].id_group!=''){
                        deleteGroupFriend(re.result[0].id_group)
                        .then(rel=>{
                            if(rel.count>0){
                                socket.emit('server delete friend',data);
                                io.to(data).emit('server delete friend',auth.gmail);
                            }
                        })
                        .catch(error=>{
                            socket.emit('server delete friend','error');
                            console.log(error)
                        })
                    }
                }
            })
            .catch(err=>{
                console.log(err)
                socket.emit('server delete friend','error');
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('list messages',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            listMessages(auth.gmail,data)
            .then(re=>{
                socket.emit('server list messages',re.result);
            })
            .catch(err=>{

            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('send messages friend',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            sendMesages(auth.gmail,data.id_group,data.content)
            .then(rel=>{
                socket.emit('server send messages',data.id_group);
                io.to(data.gmail).emit('server send messages',data.id_group);
            })
            .catch(err=>{
                console.log(err);
                socket.emit('server send messages','error');
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('send messages group',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            sendMesages(auth.gmail,data.id_group,data.content)
            .then(rel=>{
                socket.emit('server send messages group',data.id_group)
                io.to(data.id_group).emit('server send messages group',data.id_group);
            })
            .catch(err=>{
                console.log(err);
            })
        }else{
            socket.emit('no auth')
        }
    })
    socket.on('delete group',group=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            deleteGroup(auth.gmail,group)
            .then(re=>{
                io.to(group).emit('server delete group',group);
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })
           
    socket.on('delete all messages',id=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            deleteAllMessages(auth.gmail,id)
            .then(re=>{
                socket.emit('server delete all messages','ok');
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }        
    })
    socket.on('create group',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            createGroup(auth.gmail,data)
            .then(re=>{
                socket.emit('server create group','ok');
                data.friends.map(el=>{
                    io.to(el).emit('server create group','ok');
                })
            })
            .catch(err=>{
                console.log(err);
            })

        }else{
            socket.emit('no auth')
        }
    })
    socket.on('cancel messages',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            cancelMessages(data.id_mess,auth.gmail,data.room)
            .then(re=>{ 
                io.to(data.room).emit('server cancel messages',{...data})
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }        
    })
    socket.on('leave group',group=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            let rule = -1;
            checkRule(auth.gmail,group)
            .then(re=>{
                if(re.count>0){
                    rule =re.result[0].rule;
                    leaveGroup(auth.gmail,group)
                    .then(rel=>{
                        if(rule===0){
                            console.log('main leave')
                            io.to(group).emit('server main leave group',group);
                        }else{
                            socket.leave(group);
                            io.to(group).emit('server leave group',group);
                            socket.emit('server leave group gmail',group);
                        }
                    }) 
                    .catch(error=>{
                        console.log(error)
                    })
                }
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })

    socket.on('add member',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            addMember(auth.gmail,data.gmail,data.room)
            .then(re=>{
                findGroup(data.gmail,data.room)
                .then(rel=>{
                    io.to(data.room).emit('server add member',{...data});
                    io.to(data.gmail).emit('server add member gmail',rel.result[0]);
                })  
                .catch(error=>{
                    console.log(error)
                })
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })

    socket.on('kick out group',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            kickOutGroup(auth.gmail,data.gmail,data.room)
            .then(re=>{
                io.to(data.room).emit('server kick out group',{...data});
                io.to(data.gmail).emit('server kick out group gmail',{...data});
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })

    socket.on('change leader group',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            console.log(data)
            grantPermission(auth.gmail,data.gmail,data.room,0)
            .then(re=>{
                io.to(data.room).emit('server grant permission',{...data});
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })

    socket.on('change deputy group',data=>{
        let auth = verify(socket.handshake.auth.token);
        if(auth != 'JsonWebTokenError' && auth != 'TokenExpiredError'){
            grantPermission(auth.gmail,data.gmail,data.room,1)
            .then(re=>{
                io.to(data.room).emit('server grant permission',{...data});
            })
            .catch(err=>{
                console.log(err)
            })
        }else{
            socket.emit('no auth')
        }
    })


})
server.listen(3500,()=>{
    console.log('server running on port 3500');
})