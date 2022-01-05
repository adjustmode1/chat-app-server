const pool = require('./connect');

const listFriends = (owner) => new Promise((resolve,reject)=>{
        pool.query(`select * from friends where owner= $1`,[owner])
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
const changeNameFriend = (owner,friend,name) => new Promise((resolve,reject)=>{
    pool.query(`update friends set name=$1 where owner = $2 and gmail = $3`,[name,owner,friend])
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

const findFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`select * from friends where owner = $1 and gmail = $2;`,[owner,gmail])
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
const blockFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`update friends set rule = true where owner = $1 and gmail = $2;`,[owner,gmail])
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

const unBlockFriend = (owner,gmail) => new Promise((resolve,reject)=>{
    pool.query(`update friends set rule = false where owner = $1 and gmail = $2;`,[owner,gmail])
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
    listFriends,
    changeNameFriend,
    findFriend,
    blockFriend,
    unBlockFriend
}