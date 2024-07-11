const dotenv = require('dotenv')
const {getPublicKey, finalizeEvent} = require("nostr-tools")
const {bech32} = require("bech32")
const {WebSocket} = require('ws')
const ws = new WebSocket('ws://localhost:8080')
dotenv.config()

async function sendMessage(message) {
    function bech32Decoder(currPrefix, data) {
      const { prefix, words } = bech32.decode(data)
      if (prefix !== currPrefix) {
          throw Error('Invalid address format')
      }
      return Buffer.from(bech32.fromWords(words))
    }

    //keyValue is a user input
    let skDecoded = bech32Decoder('nsec', process.env.NOSTR_SK)
    let pk = getPublicKey(skDecoded)
    let event = {
        kind: 1,
        pubkey: pk,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: message,
    }
    let eventFinal = `["EVENT",${JSON.stringify(finalizeEvent(event, skDecoded))}]`
    
    console.log('eventFinal:', event)
    try {
      ws.on('open', function open() {
        ws.send(eventFinal)
      })
    } catch (e) {
        console.error('Failed to publish to any relay:', e)
    } finally {
//        pool.close(RELAYS)
    }
}
sendMessage("Hello World")
