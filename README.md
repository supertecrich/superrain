##
SUPERRAIN
=========
SuperRain is a high performance NOSTR relay with a focus on simplicity and DVM (NIP 89,90) support. It aims to support larger notes that may be required by DVMs

## Features
- High performance
- All JavaScript

## Installation
1. Clone the repository
2. Set the following Env variables in either a .env file in the root dir or the path
    * `PORT` - The port to run the server on
    * `NODE_ENV` - The environment to run the server in
    * `PURGE_INTERVAL` - The interval to purge old notes
    * `MONGODB_URI` - The host of the database
    * `MONGODB_DB` - The name of the database 
    * NOTE: If db is not provided - the app will use an in memory set
3. Run `npm install`
3. Run `npm start`


#### Credits
Thanks to https://github.com/coracle-social/bucket/tree/master for the original websocket implementation
