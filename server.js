require('dotenv').config()
const console = require('./src/logger')
const {WebSocketServer} = require("ws")
const Relay = require('./src/relay')
const Subscription = require('./src/subscription')
const {DB, MongoDB} = require('./src/db/db')

const USE_BLACKLIST = process.env.NPUB_BLACKLIST && process.env.NPUB_BLACKLIST.toLowerCase() === 'true'
const USE_WHITELIST = process.env.NPUB_WHITELIST && process.env.NPUB_WHITELIST.toLowerCase() === 'true'

if (USE_BLACKLIST && USE_WHITELIST) {
    throw new Error('Cannot use a whitelist and blacklist together. Pick one.')
}

//**** GLOBAL STORES ****
const PURGE_INTERVAL = process.env.PURGE_INTERVAL || false
let connCount = 0
let subscriptions = new Subscription()
let lastPurge = Date.now()
let purgeInterval = null
let db = null

async function setupDB() {
    try {
        console.debug('Setting up db. I should only happen once.')
        if (db) {
            return db
        }
        if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
            db = await MongoDB.init()
            console.warn('Using mongoDB to store events.')
        } else {
            db = await DB.init()
            console.warn('Using in memory event store - Having a purge interval is highly reccommended.')
        }
        if (PURGE_INTERVAL && db && parseInt(PURGE_INTERVAL) > 0) {
            console.warn('Purging events every', PURGE_INTERVAL, 'seconds')
            purgeInterval = setInterval(async () => {
                await db.purgeEvents()
                console.warn('Events Purged')
                lastPurge = Date.now()
            }, PURGE_INTERVAL * 1000)
        } else {
            console.warn('No purge interval integer set. Events will not be purged.')
        }
        return db
    } catch (e) {
        console.error(`Error occurred setting up db: ${e}`)
    }
}

// For every connection - give it the global stores and setup a relay instance which will manage that connections I/O
async function SocketServer(socket) {
    connCount += 1

    console.info('Received connection', {connCount})
    //  console.info(`DB has: ${JSON.stringify(db.getCachedEvents(), null, 2)}`)

    const relay = new Relay(db, subscriptions, socket)

    if (PURGE_INTERVAL && purgeInterval && parseInt(PURGE_INTERVAL) > 0) {
        const now = Date.now()
        const nextIn = Math.round((PURGE_INTERVAL * 1000 - (now - lastPurge)) / 1000)
        relay.send(['NOTICE', '', 'Next purge in ' + nextIn + ' seconds'])
    }

    socket.on('pong', () => {
        this.isAlive = true
    })
    socket.isAlive = true
    socket.on('message', msg => relay.handleIncomingMessage(msg))
    socket.on('error', e => console.error("Received error on client socket", e))
    socket.on('close', () => {
        console.info('Closing connection', {connCount})
        connCount -= 1
        relay.cleanup()
    })
}

async function Server(httpServer) {
    await setupDB()
    let server = new WebSocketServer({server: httpServer})
    let unresponsiveTimeout = process.env.CLOSE_UNRESPONSIVE_CLIENTS_INTERVAL * 1000 || 30000
    server.on('connection', SocketServer)
    server.on('close', () => {
        console.info('Closing down the web socket server.')
        if (PURGE_INTERVAL || purgeInterval) {
            clearInterval(purgeInterval)
        }
        clearInterval(closeUnresponsiveConns)
    })

    const closeUnresponsiveConns = setInterval(function ping() {
        server.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate()

            ws.isAlive = false
            ws.ping()
        })
    }, unresponsiveTimeout)

    console.warn(`CONFIG - ENV: ${process.env.NODE_ENV}, Purge Interval(seconds) ${PURGE_INTERVAL}, Unresponsive Check(seconds): ${unresponsiveTimeout / 1000}`)
    if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
        console.warn('CONFIG - MONGODB_URI env var found. Using mongoDB to store events.')
    } else {
        console.warn('CONFIG - No MONGODB_URI env var found. Using in memory event store.')
    }
    return server
}

module.exports = Server