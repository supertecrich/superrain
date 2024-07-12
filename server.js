const console = require('./src/logger')
const Relay = require('./src/relay')
const Subscription = require('./src/subscription')
const dotenv = require('dotenv')
const {matchFilters} = require('nostr-tools')
const {WebSocketServer} = require('ws')
const {DB} = require('./src/db/db')
dotenv.config()

const pid = Math.random().toString().slice(2, 8)
const wss = new WebSocketServer({port: process.env.PORT})
const PURGE_INTERVAL = process.env.PURGE_INTERVAL || false

console.info(`SUPERRAIN: Relay running on ${process.env.PORT}. PID: ${pid}. Purge Interval(seconds) ${PURGE_INTERVAL}. Waiting for connections...`)

//**** GLOBAL STORES ****
let connCount = 0
//TODO this DB should be based on if we have a URI and DB set in the env file
let db = new DB()
let subscriptions = new Subscription()
let lastPurge = Date.now()

if (PURGE_INTERVAL) {
  console.log('Purging events every', PURGE_INTERVAL, 'seconds')
  setInterval(async () => {
    await db.purgeEvents()
    lastPurge = Date.now()
  }, PURGE_INTERVAL * 1000)
}


// For every connection - give it the global stores and setup a relay instance which will manage that connections I/O
wss.on('connection', socket => {
  connCount += 1

  console.info('Received connection', {pid, connCount})
  console.info(`DB has: ${JSON.stringify(db.getCachedEvents(), null, 2)}`)

  const relay = new Relay(db, subscriptions, socket)

  if (PURGE_INTERVAL) {
    const now = Date.now()
    relay.send(['NOTICE', '', 'Next purge in ' + Math.round((PURGE_INTERVAL * 1000 - (now - lastPurge)) / 1000) + ' seconds'])
  }

  socket.on('message', msg => relay.handleIncomingMessage(msg))
  socket.on('error', e => console.error("Received error on client socket", e))
  socket.on('close', () => {
    console.info('Closing connection', {pid, connCount})
    connCount -= 1
    relay.cleanup()
  })
})
