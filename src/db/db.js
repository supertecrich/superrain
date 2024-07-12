const {MongoClient, ServerApiVersion} = require('mongodb')
const {connect} = require('mongoose')
const console = require('../logger')

const DB_URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB

let rawConnection
let gooseConnection

// test
// export async function mongooseDB() {
//   try {
//     if (!gooseConnection) {
//       console.debug('Not connected to the DB. Reconnecting to: ', DB)
//       gooseConnection = await connect(DB_URI, {dbName: DB, serverApi: ServerApiVersion.v1})
//       gooseConnection.connection.on('error', err => {
//         console.error(err)
//       })
//       console.debug('Connected to the DB: ', DB)
//     }
//     return gooseConnection
//   } catch (error) {
//     console.error(error)
//   }
// }
//
// export async function rawMongoDB(uri, db) {
//   if (!rawConnection) {
//     debugger
//     console.debug('Not connected to the external DB. Reconnecting.')
//     console.log(DB_URI)
//     const client = new MongoClient(DB_URI, {serverApi: ServerApiVersion.v1})
//     rawConnection = await client.connect()
//     // rawConnection = client.db(DB)
//     // console.debug('Connected to the DB:',rawConnection.databaseName)
//   }
//   return rawConnection
// }

class InternalDB {
  constructor() {
    // this.client = new MongoClient(DB_URI, {serverApi: ServerApiVersion.v1})
    // this.client.connect()
    // this.db = this.client.db(DB)
    console.info('db constructor called.')
    this._eventsDB = []
  }

  async purgeEvents() {
    this._eventsDB = []
  }

  async addEvent(event) {
    this._eventsDB = this._eventsDB.concat(event).sort((a, b) => a > b ? -1 : 1)
  }

  async getEvents() {
    return this._eventsDB
  }

  getCachedEvents() {
    return this._eventsDB
  }
}

module.exports = {
  DB: InternalDB
}