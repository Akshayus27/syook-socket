const crypto = require('crypto')

// Creating a key to be the basis of the encryption and decryption
const key = crypto.createHash('sha256').update('userdetailencryption', 'utf-8').digest('hex').substr(0, 32)

exports.encrypt = function(user) {
    // Secret key based on the data of the user
    const {data, secret_key} = keyGenerator(user)
    user['secret_key'] = secret_key

    // Set the vector to be of 16 bits based cycle
    const iv = crypto.randomBytes(16)

    // Cipher it with aes-256 algorithm
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)

    // Create buffer of the cipher
    const encrypted = Buffer.concat([cipher.update(data + ',' + secret_key), cipher.final()])

    // Change the buffer to a hexadecimal string
    const encryptedAsString = iv.toString('hex') + encrypted.toString('hex')
    return {finalEncryption:encryptedAsString}
}

exports.decrypt = function(encryption) {
    // Decipher it with aes-256 algorithm based on the key created
    const decipher = crypto.createDecipheriv('aes-256-ctr', key, Buffer.from(encryption.substr(0, 32), 'hex'))

    // Changing the deciphered that is buffered to the objects
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryption.substr(32), 'hex')), decipher.final()])
    
    // Changing the objects to string and then split them to an array of strings
    return decrypted.toString().split(',')
}

exports.getSecretKey = function(user) {
    // Generate the secret key for the user
    return keyGenerator(user)
}

const keyGenerator = function(user) {
    // Join the objects to make it as one string
    const data = [user.name, user.location, user.destination].join(',')
    return {data: data, secret_key: crypto.createHash('sha256').update(data, 'utf-8').digest('hex')}
}