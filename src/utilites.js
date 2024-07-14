const KSUID = require('ksuid')

const tsUUID = () => {
  return `${KSUID.randomSync().toJSON()}`
}

module.exports = {
  tsUUID
}