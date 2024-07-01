const {mongooseDB} = require('@/app/db/db')
const {tsUUID} = require('@/app/utils/utils')

let compiledLogModel
async function logModel() {
  if (compiledLogModel) {
    return compiledLogModel
  }
  const db = await mongooseDB()
  const logSchema = new db.Schema({
    _id: {
      type: String,
      default: tsUUID
    },
    createdDT: Number,
    endpoint: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    contextId: String,
    transactionID: {
      type: String,
      default: tsUUID
    },
    inputs: Object,
    outputs: Object,
    inputCost: Number,
    outputCost: Number,
    totalCost: Number,
    responseTime: Number
  })
  logSchema.pre('save', function (next) {
    if (this.isNew) {
      this.createdDT = new Date().getTime()
    }
    next()
  })
  compiledLogModel = db.model('io_logs', logSchema)
  return compiledLogModel
}

async function logIO(logType, endpoint, userId, contextId='', inputs, outputs, inputCost, outputCost, totalCost, responseTime, status) {
  let logs = await logModel()
  let log = await logs.create({
    _id: `${logType || 'LOG'}-${tsUUID()}`,
    endpoint,
    userId,
    contextId,
    inputs,
    outputs,
    inputCost,
    outputCost,
    totalCost,
    responseTime,
  })
  return log
}

module.exports = {
  'Logs': logModel,
  logIO: logIO
}