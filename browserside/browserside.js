const {encrypt} = require('../encryptions/encryption')

exports.hideData = (request, socket) => {
    const users = [...request]
    let encryptedString = ''

    for (let user of users) {
        // Sends the data to be encrypted and get backs the encrypted string
        const {finalEncryption} = encrypt(user)
        encryptedString += (finalEncryption + '|')
    }
    // Remove the extra pipe on the last encrypted string added
    encryptedString = encryptedString.slice(0, -1)

    // Sends the string back for the server to listen for it
    socket.send(encryptedString)
}