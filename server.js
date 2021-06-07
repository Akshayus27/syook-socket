const WebSocketServer = require('ws').Server
const WebSocket = require('ws')
const http = require('http')
const server = http.createServer()
const MongoClient = require('mongodb').MongoClient
const serverside = require('./serverside/serverside')
const browserside = require('./browserside/browserside')
const data = require('./data')

// Port nummber assigned or takes the environment's port
const PORT = process.env.PORT || 8084

// Connection established for the database and creating the database and collection
let dbo
MongoClient.connect("mongodb://localhost:27017/", (err, db) => {
    if (!err) {
        dbo = db.db('Syook-Place')
        dbo.createCollection('persons', (err, res) => {
            if (err) {
                console.log(err)
            }
        })
        console.log('Connected to the database...')
    }
})

// Server listens to the port and connects to it
server.listen(PORT, () => console.log(`Server connected to the port: ${PORT}... \n ${new Date()}`))

// Client side socket object
const websocketclient = new WebSocket(`ws://localhost:${PORT}`)

// Server side socket object
const websocket = new WebSocketServer({server})

// Server side functions

// Listens for the data send from the client
websocket.on('connection', (connection) => {
    connection.on('message', (message) => {
        serverside.uploadData(message, connection, dbo)
    })
})

// Client side functions

// Sends the data when the connection is open
websocketclient.onopen = () => {
    setInterval(() => {
        websocketclient.setMaxListeners(0)
        websocketclient.emit(browserside.hideData(data, websocketclient))
    }, 10000)
}

// Listens for the data sent from the server
websocketclient.onmessage = (message) => {
    console.log(JSON.parse(message.data))
}

