##
SUPERRAIN
=========
SuperRain is a high performance NOSTR relay with a focus on simplicity and DVM (NIP 89,90) support. Long term it aims to be the premier DVM relay and to support larger notes that may be required by DVMs

## Features
- High performance
- All JavaScript
- Dockerfile included for easy production deployment
- In memory or Mongo DB support
- Auto cleanup of messages
- Whitelist / Blacklist NPUB support

## Installation
1. Clone the repository
2. Set the following Env variables in either a .env file in the root directory or on the path
    * `PORT` - The port to run the server on
    * `NODE_ENV` - The environment to run the server in. We reccommend keeping this on production unless you are doing development work on the server.
    * `PURGE_INTERVAL` - The interval to purge old notes. Leave this blank if you wish to keep notes forever. (defaults if unset to off)
    * `MONGODB_URI` - The host of the database (required for mongoDB persistance) - Leave this blank to have superrain use an in memory store for notes.
    * `MONGODB_DB` - The name of the database (required for mongoDB persistance) - Leave this blank to have superrain use an in memory store for notes.
       * NOTE: If db is not provided - the app will use an in memory set, in which case you should ensure you have sufficient memory on the server. We highly reccommend you set a `PURGE_INTERVAL`
    * `CLOSE_UNRESPONSIVE_CLIENTS_INTERVAL` - Time between checks for unresponsive clients. This ensures server doesn't stay connected to clients that unexpectedly disconnected (defaults to 30 seconds)
   * `NPUB_WHITELIST` - Set to true to use the array of npubs in `npub_whitelist.json` as a whitelist
   * `NPUB_BLACKLIST` - Set to true to use the array of npubs in `npub_blacklist.json` as a blacklist
     * NOTE: You may not use the blacklist and the whitelist at the same time. An error will be thrown if you set both of these to true.
   * `KIND_ALLOWED` - Set to true to use the array of NIPs allowed in `kind_allowed.json` If a kind is sent that is not in this list the relay will not process it, save it, or relay it. It will issue a error in response.
3. Run `yarn install`
3. Run `npm start`

## Alternative way to run this - in a docker container
1. Build the container locally: `docker build -f Dockerfile -t superrain .`
2. Run the container locally: `docker run -p 80:80 superrain`

## NIPS Supported
#### Feel free to open a PR if you wish to add support for a NIP - we prioritize NIPS we need internally first.
* NIP-1
* NIP-2
* NIP-89 (coming soon)
* NIP-90 (coming soon)

#### Credits
Thanks to https://github.com/coracle-social/bucket/tree/master for the original websocket implementation
