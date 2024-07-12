const console = require('./logger.js')

class Subscription {
  constructor() {
    this._subs = new Map()
  }

  addNewSubscription(key, value) {
    this._subs.set(key, value)
  }

  removeSubscription(key) {
    this._subs.delete(key)
  }

  getSubscriptions() {
    return this._subs.entries()
  }

  clearSubscriptions() {
    this._subs = new Map()
  }
}

module.exports = Subscription