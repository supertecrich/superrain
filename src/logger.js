const console = require('loglevel')

const NODE_ENV = process.env.NODE_ENV || 'development'
const DEBUG_SETTING = process.env.DEBUG || 'false'

console.setLevel('info')
// console.warn(`LOGGER SET TO INFO - ENV: ${NODE_ENV}, DEBUG_SETTING: ${DEBUG_SETTING}`)

if (NODE_ENV === 'production') {
  console.setLevel('warn')
}

if (DEBUG_SETTING === 'debug' || DEBUG_SETTING !== 'false') {
  console.setLevel('debug')
  console.warn(`LOGGER SET TO DEBUG - ENV: ${NODE_ENV}, DEBUG_SETTING: ${DEBUG_SETTING}`)
}
if (DEBUG_SETTING === 'info') {
  console.setLevel('info')
  console.warn(`LOGGER SET TO INFO - ENV: ${NODE_ENV}, DEBUG_SETTING: ${DEBUG_SETTING}`)
}
if (DEBUG_SETTING === 'trace') {
  console.setLevel('trace')
  console.warn(`LOGGER SET TO TRACE - ENV: ${NODE_ENV}, DEBUG_SETTING: ${DEBUG_SETTING}`)
}

module.exports = console
