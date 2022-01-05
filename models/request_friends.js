const pool = require('./connect');

const listRequestFriend = (owner) => new Promise((resolve,reject)=>{
    pool.query(`select r.owner,u.gmail,u.name,u.birthday,u.address,u.phone_number,u.sex from request_friends r, users u where r.gmail = u.gmail and r.owner = $1;`,[owner])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 
const listAcceptFriend = (owner) => new Promise((resolve,reject)=>{
    pool.query(`select r.owner,u.gmail,u.name,u.birthday,u.address,u.phone_number,u.sex from request_friends r, users u where r.owner = u.gmail and r.gmail = $1;`,[owner])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

const findRequestFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`select r.owner,r.gmail,u.name,u.birthday,u.address,u.phone_number,u.sex from request_friends r, users u where r.owner = u.gmail and r.owner = $1 and r.gmail = $2;`,[gmail,owner])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

const findAcceptFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`select r.owner,r.gmail,u.name,u.birthday,u.address,u.phone_number,u.sex from request_friends r, users u where r.owner = u.gmail and r.owner = $1 and r.gmail = $2;`,[gmail,owner])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

const deleteRequestFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`delete from request_friends where owner = $1 and gmail = $2;`,[owner,gmail])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

const updateRequestFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`update request_friends set status = true where owner = $1 and gmail = $2;`,[owner,gmail])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

const addRequestFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`insert into request_friends values($1,$2,false);`,[owner,gmail])
        .then(result=>{
            resolve({
                status:200,
                count:result.rowCount,
                result:result.rows
            })
        })
        .catch(err=>{
            console.log(err)
            reject({
                status:400
            })
        })
    }) 

module.exports = {
    listRequestFriend,
    listAcceptFriend,
    deleteRequestFriend,
    updateRequestFriend,
    findRequestFriend,
    findAcceptFriend,
    addRequestFriend
}