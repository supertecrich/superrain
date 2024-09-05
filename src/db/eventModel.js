const console = require('../logger')
const {tsUUID} = require('../utilities')

let compiledEventModel

async function eventModel(db) {
    if (compiledEventModel) {
        return compiledEventModel
    }
    const eventSchema = new db.Schema({
        _id: {
            type: String,
            default: tsUUID
        },
        createdDT: Number,
        event: Object
    })
    eventSchema.pre('save', function (next) {
        if (this.isNew) {
            this.createdDT = new Date().getTime()
        }
        next()
    })
    compiledEventModel = db.model('relay_events', eventSchema)
    return compiledEventModel
}

module.exports = {
    'Events': eventModel
}