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

//async function logIO(logType, endpoint, userId, contextId='', inputs, outputs, inputCost, outputCost, totalCost, responseTime, status) {
//  let logs = await logModel()
//  let log = await logs.create({
//    _id: `${logType || 'LOG'}-${tsUUID()}`,
//    endpoint,
//    userId,
//    contextId,
//    inputs,
//    outputs,
//    inputCost,
//    outputCost,
//    totalCost,
//    responseTime,
//  })
//  return log
//}

module.exports = {
  'Events': eventModel
}