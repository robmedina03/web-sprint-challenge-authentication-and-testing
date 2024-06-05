const db= require('../../data/dbConfig')

async function add(user){
    const [id] = await db('users').insert(user);
    return findById(id)
}

function findBy(filter) {
    return db('users').where(filter)
}

function findById(id) {
    return db('users').where({id}).first()
}

module.exports ={
    add,
    findBy,
    findById
}