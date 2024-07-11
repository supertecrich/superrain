const {matchFilters} = require('nostr-tools')
const console = require('./logger.js')

class Relay {
  constructor(db, socket) {
    this._socket = socket
    this._subs = new Set()
    this._db = db
  }
  cleanup() {
    // used for on close
    this._socket.close()

    for (const subId of this._subs) {
      this.removeSub(subId)
    }
  }
  addSub(subId, filters) {
    this._subs.set(subId, {instance: this, filters})
    console.debug(`New subscriber added(ID:${subId}): ${filters}`)
  }
  removeSub(subId) {
    console.debug(`Removing subscriber ${subId} - ${this._subs[subId].filters}}`)
    this._subs.delete(subId)
  }
  getSubs() {
    return this._subs
  }
  send(message) {
    this._socket.send(JSON.stringify(message))
  }
  handleIncomingMessage(message) {
    try {
      message = JSON.parse(message)
    } catch (e) {
      console.error('An error occurred parsing incoming websocket message', e)
      this.send(['NOTICE', '', 'Unable to parse message'])
    }

    let verb, payload
    try {
      [verb, ...payload] = message
      console.info(`Verb Found: ${verb}`)
    } catch (e) {
      console.error('An error occurred processing parsed message', e, message)
      this.send(['NOTICE', '', 'Unable to read message'])
    }

    const verbHandler = this[`on${verb}`]

    if (verbHandler) {
      verbHandler.call(this, ...payload)
    } else {
      console.error(`No verb handler for that message type.`)
      this.send(['NOTICE', '', 'Unable to handle message'])
    }
  }
  onCLOSE(subId) {
    this.removeSub(subId)
  }
  async onREQ(subId, ...filters) {
    console.info('REQ', subId, ...filters)
    let events = await this._db.getEvents()

    this.addSub(subId, filters)

    for (const event of events) {
      if (matchFilters(filters, event)) {
        console.info('match', subId, event)

        this.send(['EVENT', subId, event])
      } else {
        console.info('miss', subId, event)
      }
    }

    console.info('EOSE')

    this.send(['EOSE', subId])
  }
  async onEVENT(event) {
    await this._db.addEvent(event)

    console.info('EVENT', event, true)

    this.send(['OK', event.id, true])

    for (const [subId, {instance, filters}] of this._subs.entries()) {
      if (matchFilters(filters, event)) {
        console.info('match', subId, event)

        instance.send(['EVENT', subId, event])
      }
    }
  }
}

module.exports = Relay
