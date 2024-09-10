#! /opt/homebrew/bin/node
const {WebSocket} = require('ws')
const ws = new WebSocket('ws://localhost:8080')

ws.on('error', console.error);

ws.on('open', function open() {
  ws.send(`["REQ","1234",${JSON.stringify({kind: 1})}]`)
})


ws.on('message', function message(data) {
  console.log('received: %s', data)
})