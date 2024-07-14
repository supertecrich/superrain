const {MongoClient, ServerApiVersion} = require('mongodb')
const console = require('../logger')
const {connect} = require('mongoose')
const {Events} = require('./eventModel')

const DB_URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB

let gooseConnection
let _eventsDB = []

 async function mongooseDB() {
   try {
     if (!gooseConnection) {
       console.debug('Not connected to the DB. Reconnecting to: ', DB)
       gooseConnection = await connect(DB_URI, {dbName: DB, serverApi: ServerApiVersion.v1})
       gooseConnection.connection.on('error', err => {
         console.error(err)
       })
       console.debug('Connected to the DB: ', DB)
     }
     return gooseConnection
   } catch (error) {
     console.error(error)
   }
 }
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

class MongoDB {
  constructor (newDb, newModels) {
    if (typeof newDb === 'undefined' || typeof newModels === 'undefined') {
        throw new Error('Cannot be called directly')
    }
    this.db = newDb
    this.models = newModels
  }

  static async init () {
    //    let client = new MongoClient(DB_URI, {serverApi: ServerApiVersion.v1})
    //    await client.connect()
    //    let db = client.db(DB)
    let db = await mongooseDB()
    let eventsModel = await Events(db)
    let models = {
      events: eventsModel
    }

    return new MongoDB(db, models)
  }

  async purgeEvents() {
    for await(const [key, value] of Object.entries(this.models)) {
      await value.deleteMany({})
    }
  }

  async addEvent(event) {
    await this.models.events.create({
      event: event
    })
  }

  async getEvents() {
    return await this.models.events.find({}).sort({createdDT: 1})
  }
}

class InternalDB {
  constructor() {
    this._eventsDB = _eventsDB
  }

  static async init() {
    return new InternalDB()
  }

  async purgeEvents() {
    _eventsDB = []
  }

  async addEvent(event) {
    _eventsDB = _eventsDB.concat(event).sort((a, b) => a > b ? -1 : 1)
  }

  async getEvents() {
    return _eventsDB
  }
}

module.exports = {
  DB: InternalDB,
  MongoDB: MongoDB,
  mongooseDB: mongooseDB
}