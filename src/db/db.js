const {MongoClient, ServerApiVersion} = require('mongodb')
const console = require('../logger')
const {mongoose} = require('mongoose')
const {Events} = require('./eventModel')

// mongoose.set('bufferCommands', false)

const DB_URI = process.env.MONGODB_URI
const DB = process.env.MONGODB_DB

let gooseConnection
let _eventsDB = []

async function mongooseDB() {
    try {
        if (!gooseConnection) {
            console.info('Not connected to the DB. Connecting to: ', DB)
            gooseConnection = await mongoose.connect(DB_URI, {dbName: DB, serverApi: ServerApiVersion.v1})
            gooseConnection.connection.on('error', err => {
                console.error(err)
            })
        }
        console.info('Connected to the DB: ', DB)
        return gooseConnection
    } catch (error) {
        console.error(error)
    }
}

class MongoDB {
    constructor(newDb, newModels) {
        if (typeof newDb === 'undefined' || typeof newModels === 'undefined') {
            throw new Error('Cannot be called directly')
        }
        this.db = newDb
        this.models = newModels
    }

    static async init() {
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
        console.warn('Event count:', await this.countEvents())
    }

    async getEvents() {
        return await this.models.events.find({}).sort({createdDT: 1})
    }

    async countEvents() {
        return await this.models.events.countDocuments()
    }
}

class InternalDB {
    constructor() {
        this._eventsDB = _eventsDB
    }

    static async init() {
        // fake async call using sleep - making sure internal and external inits work the same
        await new Promise(resolve => setTimeout(resolve, 600))
        return new InternalDB()
    }

    async purgeEvents() {
        _eventsDB = []
    }

    async addEvent(event) {
        _eventsDB = _eventsDB.concat(event).sort((a, b) => a > b ? -1 : 1)
        console.warn('Event count:', await this.countEvents())
    }

    async getEvents() {
        return _eventsDB
    }

    async countEvents() {
        return _eventsDB.length
    }
}

module.exports = {
    DB: InternalDB,
    MongoDB: MongoDB,
    mongooseDB: mongooseDB
}