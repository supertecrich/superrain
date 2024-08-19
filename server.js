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

// For every connection - give it the global stores and setup a relay instance which will manage that connections I/O
async function SocketServer(socket) {
  connCount += 1
  let db = null
  try {
    if (process.env.MONGODB_URI && process.env.MONGODB_DB) {
      db = await MongoDB.init()
      console.info('Using mongoDB to store events.')
    } else {
      db = await DB.init()
      console.info('Using in memory event store - Having a purge interval is highly reccommended.')
    }
  } catch (e) {
    console.error(`Error occurred setting up db: ${e}`)
  }

  if (PURGE_INTERVAL && db) {
    console.info('Purging events every', PURGE_INTERVAL, 'seconds')
    purgeInterval = setInterval(async () => {
      console.info('Events Purged')
      await db.purgeEvents()
      lastPurge = Date.now()
    }, PURGE_INTERVAL * 1000)
  }

  console.info('Received connection', {connCount})
  //  console.info(`DB has: ${JSON.stringify(db.getCachedEvents(), null, 2)}`)

  const relay = new Relay(db, subscriptions, socket)

  if (PURGE_INTERVAL) {
    const now = Date.now()
    relay.send(['NOTICE', '', 'Next purge in ' + Math.round((PURGE_INTERVAL * 1000 - (now - lastPurge)) / 1000) + ' seconds'])
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

function Server(httpServer) {

  let server = new WebSocketServer({ server: httpServer })
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

  console.info(`CONFIG - ENV: ${process.env.NODE_ENV}, Purge Interval(seconds) ${PURGE_INTERVAL}, Unresponsive Check(seconds): ${unresponsiveTimeout / 1000}`)
  return server
}

module.exports = Server