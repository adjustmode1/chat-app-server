const pool = require('./connect');

const listGroups = (owner) => new Promise((resolve,reject)=>{
    pool.query(`select gr.id_group,gr.name,gr.create_at,gr.rule ,de.member,de.rule from groups gr inner join group_detail de on gr.id_group = de.id_group where member = $1;
        `,[owner])
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

const findGroup = (owner,id) => new Promise((resolve,reject)=>{
    pool.query(`select gr.id_group,gr.name,gr.create_at,gr.rule ,de.member,de.rule from groups gr inner join group_detail de on gr.id_group = de.id_group where member = $1 and gr.id_group=$2;
        `,[owner,id])
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

const changeNameGroup = (gmail,group,name) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_change_name_group($1,$2,$3)`,[gmail,group,name])
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

const deleteGroupFriend = (id_group) => new Promise((resolve,reject)=>{
    pool.query(`delete from groups where id_group = $1`,[id_group])
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
const deleteGroup = (gmail,id_group) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_delete_group($1,$2)`,[gmail,id_group])
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
const createGroup = (gmail,group) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_create_group($1,$2,$3)`,[gmail,group.name,group.friends])
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

const leaveGroup = (gmail,group) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_out_group($1,$2)`,[gmail,group])
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

const kickOutGroup = (owner,gmail,group) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_kick_out_group($1,$2,$3)`,[owner,gmail,group])
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
    listGroups,
    changeNameGroup,
    deleteGroup,
    deleteGroupFriend,
    createGroup,
    findGroup,
    leaveGroup,
    kickOutGroup
}