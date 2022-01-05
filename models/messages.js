const pool = require('./connect');

const listMesageFriend = (owner) => new Promise((resolve,reject)=>{
    pool.query(`select DISTINCT(f.id_group) ,f.gmail,f.name,f.rule from message_owner mo, messages m,friends f where mo.id_mess = m.id_mess and m.reciever = f.id_group and mo.owner = $1 and f.owner = $1;`,[owner])
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

const listMessages = (owner,group) => new Promise((resolve,reject)=>{
    pool.query(`select o.id_owner,m.id_mess,m.content,m.sender,m.reciever,m.create_at,m.status from messages m, message_owner o where m.id_mess = o.id_mess and o.owner = $1 and m.reciever= $2 order by create_at ASC;`,[owner,group])
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

const listMesageGroup = (owner) => new Promise((resolve,reject)=>{
    pool.query(`select DISTINCT(g.id_group), g.name, g.rule from message_owner mo, messages m,groups g where mo.id_mess = m.id_mess and m.reciever = g.id_group and mo.owner =$1 and g.rule = 'false';`,[owner])
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

const sendMesages = (owner,room,data) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_send_message($1,$2,$3);`,[owner,room,data])
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

const cancelMessages = (idmess,gmail,room) => new Promise((resolve,reject)=>{
    pool.query(`update messages set status = false where id_mess = $1 and sender = $2 and reciever = $3;`,[idmess,gmail,room])
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
const deleteAllMessages = (own,room)=> new Promise((resolve,reject)=>{
    pool.query(`delete from message_owner where owner = $1 and id_mess in (select id_mess from messages where reciever = $2);;`,[own,room])
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
    listMessages,
    listMesageFriend,
    listMesageGroup,
    sendMesages,
    deleteAllMessages,
    cancelMessages
}