const {WebSocket} = require('ws')
const ws = new WebSocket('ws://localhost:8080')

ws.on('error', console.error);

ws.on('message', function message(data) {
  console.log('received: %s', data)
})