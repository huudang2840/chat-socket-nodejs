const listUsers = []

// List of users
function userJoin(id, username, room){
    const user = {id, username, room}
    listUsers.push(user)
    return user
}

//Get current user
function currentUser(id){
    return listUsers.find(user => user.id === id)
}

//Get user left
function userLeft(id){
    const index = listUsers.findIndex(user => user.id === id)
    if(index !== -1){
        return listUsers.splice(index, 1)[0]
    }
}

function getRoomUsers(room){
    return listUsers.filter(user => user.room === room)
}

module.exports = {userJoin, currentUser, userLeft, getRoomUsers}