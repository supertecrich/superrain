const console = require('./src/logger')
const Relay = require('./src/relay')
const dotenv = require('dotenv')
const {matchFilters} = require('nostr-tools')
const {WebSocketServer} = require('ws')
const {DB} = require('./src/db/db')
dotenv.config()

const pid = Math.random().toString().slice(2, 8)
const wss = new WebSocketServer({port: process.env.PORT})
const PURGE_INTERVAL = process.env.PURGE_INTERVAL || false

console.info(`SUPERRAIN: Relay running on ${process.env.PORT}. PID: ${pid}. Purge Interval(seconds) ${PURGE_INTERVAL}. Waiting for connections...`)

let connCount = 0
let events = []
let subs = new Map()

// let lastPurge = Date.now()
//
// if (PURGE_INTERVAL) {
//   console.log('Purging events every', PURGE_INTERVAL, 'seconds')
//   setInterval(() => {
//     lastPurge = Date.now()
//     events = []
//   }, PURGE_INTERVAL * 1000)
// }

wss.on('connection', socket => {
  connCount += 1

  console.log('Received connection', {pid, connCount})

  const relay = new Relay(new DB(), socket)

  if (PURGE_INTERVAL) {
    const now = Date.now()
    relay.send(['NOTICE', '', 'Next purge in ' + Math.round((PURGE_INTERVAL * 1000 - (now - lastPurge)) / 1000) + ' seconds'])
  }

  socket.on('message', msg => relay.handle(msg))
  socket.on('error', e => console.error("Received error on client socket", e))
  socket.on('close', () => {
    relay.cleanup()

    connCount -= 1

    console.log('Closing connection', {pid, connCount})
  })
})
