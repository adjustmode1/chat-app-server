const pool = require('./connect');

const listUsers = (req,res)=>{
    pool.query('select * from users')
        .then(result=>{
            client.release();
            res.json(result.rows);
        })
        .catch(err=>{
            client.release();
            res.json('err');
        })
    };

const checkUser = (gmail,password) => new Promise((res,rej)=>{
    pool.query(`select * from users where gmail = $1 and password = $2`,[gmail,password])
        .then(result=>{
            if(result.rowCount ){
                res({
                    status:200,
                    data:result.rows
                })
            }else{
                res({
                    status:204
                })
            }
        })
        .catch(err=>{
            console.log('err')
            res({
                status:500
            })
        })
    }) 

const findUser = (gmail)=> new Promise((res,rej)=>{
    pool.query(`select * from users where gmail = $1`,[gmail])
        .then(result=>{
            if(result.rowCount){
                res(200)
            }else{
                res(204)
            }
        })
        .catch(err=>{
            res(500)
        })
    })       

const findUserToAddFriend = (owner,gmail)=> new Promise((res,rej)=>{
    pool.query(`select gmail,name,birthday,address,phone_number,sex from users where gmail = $1 and gmail <> $2 and gmail not in (select gmail from friends where owner = $2);`,[gmail,owner])
        .then(result=>{
            res({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            res(500)
        })
    })          

const changePass = (gmail,newpass) => new Promise((res,rej)=>{
    pool.query(`update users set password = $1 where gmail = $2`,[newpass,gmail])
            .then(rel=>{
                if(rel.rowCount){
                    res(200);
                }else{
                    res(204);
                }
            })
            .catch(err=>{
                rej(400);
            })
    })

const addUser = (gmail,password,name,birthday,address,phone) => new Promise((resolve,reject)=>{
    pool.query(`insert into users values($1,$2,$3,$4,$5,$6)`,[gmail,password,name,birthday,address,phone])
        .then(result=>{
            if(result.rowCount ){
                resolve(200)
            }else{
                resolve(204)
            }
        })
        .catch(err=>{
            console.log(err)
            resolve(400)
        })
    }) 

const updateUser = (gmail,info) => new Promise((resolve,reject)=>{
    pool.query(`update users set name=$2,birthday =$3,address = $4,phone_number = $5,sex =$6 where gmail=$1`,[gmail,info.name,info.birthday,info.address,info.phone_number,info.sex])
        .then(result=>{
            if(result.rowCount ){
                resolve(200)
            }else{
                resolve(204)
            }
        })
        .catch(err=>{
            console.log(err)
            resolve(400)
        })
    }) 

module.exports = {
    listUsers,
    checkUser,
    addUser,
    updateUser,
    findUser,
    findUserToAddFriend,
    changePass
};

// const listUsers = (req,res)=>{
//     console.log(1)
//     pool.connect()
//     .then(client=>{
//         client.query('select * from users')
//         .then(result=>{
//             console.log(2)
//             console.log(result)
//             client.release();
//             res.json(result.rows);
//         })
//         .catch(err=>{
//             console.log(3)
//             client.release();
//             res.json('err');
//         })
//     })
//     .catch(err=>{
//         console.log(4)
//         console.log(err)
//         res.json(err)
//     })
// }

// const checkUser = (gmail,password) => new Promise((res,rej)=>{
//     console.log('đã vào model',gmail+'/'+password)
//     pool.connect()
//     .then(client=>{
//         client.query(`select * from users where gmail = $1 and password = $2`,[gmail,password])
//         .then(result=>{
//             console.log('ok')
//             if(result.rowCount ){
//                 res({
//                     status:200,
//                     data:result.rows
//                 })
//             }else{
//                 res({
//                     status:204
//                 })
//             }
//         })
//         .catch(err=>{
//             console.log('err')
//             res({
//                 status:500
//             })
//         })
//     })
//     .catch(error=>{
//         console.log(error)
//     })    
// })

// const findUser = (gmail)=> new Promise((res,rej)=>{
//     pool.connect()
//     .then(client=>{
//         client.query(`select * from users where gmail = $1`,[gmail])
//         .then(result=>{
//             if(result.rowCount){
//                 res(200)
//             }else{
//                 res(204)
//             }
//         })
//         .catch(err=>{
//             res(500)
//         })
//     })          
// })

// const changePass = (gmail,newpass) => new Promise((res,rej)=>{
//     pool.connect()
//     .then(client=>{
//         client.query(`update users set password = $1 where gmail = $2`,[newpass,gmail])
//             .then(rel=>{
//                 if(rel.rowCount){
//                     res(200);
//                 }else{
//                     res(204);
//                 }
//             })
//             .catch(err=>{
//                 rej(400);
//             })
//     })
//     .catch(err=>{
//         rej(500);
//     })
// })

// const addUser = (gmail,password,name,birthday,address,phone) => new Promise((resolve,reject)=>{
//     pool.connect()
//     .then(client=>{
//         client.query(`insert into users values($1,$2,$3,$4,$5,$6)`,[gmail,password,name,birthday,address,phone])
//         .then(result=>{
//             if(result.rowCount ){
//                 resolve(200)
//             }else{
//                 resolve(204)
//             }
//         })
//         .catch(err=>{
//             console.log(err)
//             resolve(400)
//         })
//     }) 
// })