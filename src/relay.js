const {matchFilters} = require('nostr-tools')
const console = require('./logger.js')

class Relay {
  constructor(db, globalSubscriptions, socket) {
    this._socket = socket
    this._allSubscriptions = globalSubscriptions
    this._mySubscriptions = new Set()
    this._db = db
  }

  cleanup() {
    for (const subId of this._mySubscriptions) {
      this.removeSub(subId)
    }
    this._socket.close()
  }

  addSub(subId, filters) {
    this._allSubscriptions.addNewSubscription(subId, {instance: this, filters})
    this._mySubscriptions.add(subId)
    console.info(`New subscriber added(ID:${subId})`)
  }

  removeSub(subId) {
    console.info(`Removing subscriber ${subId}`)
    this._allSubscriptions.removeSubscription(subId)
    this._mySubscriptions.delete(subId)
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
      console.info(`Verb Sent: ${verb}`)
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
    console.info('EVENT', event, true)

    await this._db.addEvent(event)
    this.send(['OK', event.id, true])

    for (const [subId, {instance, filters}] of this._allSubscriptions.getSubscriptions()) {
      console.info(subId, filters)
      if (matchFilters(filters, event)) {
        console.log('match', subId, event)
        instance.send(['EVENT', subId, event])
      }
    }
  }
}

module.exports = Relay
