const KSUID = require('ksuid')
const fs = require('fs')
const console = require('./logger')

const tsUUID = () => {
  return `${KSUID.randomSync().toJSON()}`
}

// Kinds allowed turned on. Only allowing kinds in kinds_allowed.json
const USE_KINDS_ALLOWED = process.env.KIND_ALLOWED && process.env.KIND_ALLOWED.toLowerCase() === 'true'
let KINDS_ALLOWED = []
if (USE_KINDS_ALLOWED) {
  try {
    KINDS_ALLOWED = JSON.parse(fs.readFileSync('kinds_allowed.json', 'utf8'))
    console.info('Kinds allowed turned on. Only allowing kinds in kinds_allowed.json')
  } catch (e) {
    console.error('Failed to load kinds allowed when kind_allowed set to true')
    throw e
  }
}

// NPUB Blacklist turned on. Only allowing addresses not in blacklist.json
const USE_BLACKLIST = process.env.NPUB_BLACKLIST && process.env.NPUB_BLACKLIST.toLowerCase() === 'true'
let BLACKLIST = []
if (USE_BLACKLIST) {
  try {
    BLACKLIST = JSON.parse(fs.readFileSync('npub_blacklist.json', 'utf8'))
    console.info('NPUB Blacklist turned on. Only allowing addresses not in blacklist.json')
  } catch (e) {
    console.error('Failed to load blacklist when NPUB_BLACKLIST set to true')
    throw e
  }
}

// NPUB Whitelist turned on. Only allowing addresses in whitelist.json
const USE_WHITELIST = process.env.NPUB_WHITELIST && process.env.NPUB_WHITELIST.toLowerCase() === 'true'
let WHITELIST = []
if (USE_WHITELIST) {
  try {
    WHITELIST = JSON.parse(fs.readFileSync('npub_whitelist.json', 'utf8'))
    console.info('NPUB Whitelist turned on. Only allowing addresses in whitelist.json')
  } catch (e) {
    console.error('Failed to load whitelist when NPUB_WHITELIST set to true')
    throw e
  }
}

module.exports = {
  tsUUID,
  USE_KINDS_ALLOWED,
  KINDS_ALLOWED,
  USE_BLACKLIST,
  BLACKLIST,
  USE_WHITELIST,
  WHITELIST
}