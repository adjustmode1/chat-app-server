const pool = require('./connect');

const listMembers = (id) => new Promise((resolve,reject)=>{
    pool.query(`select u.gmail,u.name,gd.rule from group_detail gd,users u where u.gmail = gd.member and id_group = $1 order by gd.rule;`,[id])
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

const addMember = (owner,gmail,id) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_add_member_on_group($1,$2,$3)`,[owner,gmail,id])
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

const checkRule = (owner,id) => new Promise((resolve,reject)=>{
    pool.query(`select rule from group_detail where id_group = $1 and member = $2;`,[id,owner])
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

const grantPermission = (owner,gmail,id,rule) => new Promise((resolve,reject)=>{
    pool.query(`call procedure_grant_permission($1,$2,$3,$4);`,[owner,gmail,rule,id])
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
    listMembers,
    addMember,
    checkRule,
    grantPermission
}