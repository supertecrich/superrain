const {WebSocket} = require('ws')
const ws = new WebSocket('ws://localhost:8080')

ws.on('error', console.error);


ws.on('OK', function message(data) {
  console.log('received: %s', data)
})