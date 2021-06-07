const { decrypt, getSecretKey } = require('../encryptions/encryption')
let startdate = undefined

exports.uploadData = (request, socket, dbo) => {
    if (startdate === undefined) {
        startdate = new Date()
    }
    // Creating the array of encrypted strings seperated by the pipe
    const encryptions = request.split('|')

    for (let encryption of encryptions) {
        // Getting the decrypted string from the function
        const detail = decrypt(encryption)

        // Getting the details of the user from the decrypted array
        const [name, location, destination, secret_key] = detail
        const user = {
            'name': name,
            'location': location,
            'destination': destination
        }

        // Generating the key for the decrypted string to check if the new key
        // matches the old secret_key
        const key = getSecretKey(user)
        if (key.secret_key === secret_key) {
            user['timestamp'] = new Date()
            dbo.collection('persons').insertOne(user)

            // Calculating if the dta arecieved is within a minute
            let enddate = new Date()
            let minute = ((enddate - startdate) / 1000) / 60

            // If its within a minute add the data to the time series collection
            if (minute <= 1) {
                dbo.listCollections({name: startdate}, (err, res) => {
                    if (err) {
                        dbo.createCollection(startdate.toISOString(), (err, res) => {
                            if (err) {
                                console.log(err)
                            }
                        })
                    }
                })
                dbo.collection(startdate.toISOString()).insertOne(user)
            }
            // Else store the data to the new time series collection
            else {
                startdate = enddate
                dbo.createCollection(startdate.toISOString(), (err, res) => {
                    if (err) {
                        console.log(err)
                    }
                })
                dbo.collection(startdate.toISOString()).insertOne(user)
            }
            // Send the user details back to the client
            socket.send(JSON.stringify(user))
        }
    }
}