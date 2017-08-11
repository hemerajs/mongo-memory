# Mongo Memory

[![Build Status](https://travis-ci.org/hemerajs/mongo-memory.png)](https://travis-ci.org/hemerajs/mongo-memory)

Bootstrap programmatically Mongodb for testing or mocking during development.

Works on all platforms which is due to the awesome [mongodb-prebuilt](https://www.npmjs.com/package/mongodb-prebuilt) package.

## Installation
````
npm install mongo-memory
````

## Usage

````javascript
const MongoInMemory = require('mongo-memory')

const port = 8000
const dbPath = ".." // Mongodb placed some metadata
const mongoServerInstance = new MongoMemory(port, dbPath)

mongoServerInstance.start().then(server) => {

    mongoServerInstance.getMongouri('myDatabaseName')
    mongoServerInstance.getCollection('coll1')
    mongoServerInstance.getDocument('myDatabaseName', 'coll1', "<id>")
    mongoServerInstance.addDocument('myDatabaseName', 'coll1', { a: 1, b: 2 })
    mongoServerInstance.addDirectoryOfCollections('myDatabaseName', '<path>')

})

mongoServerInstance.stop()
````

## Background 

Mongodb storageEngione [ephemeralForTest](https://docs.mongodb.com/v3.4/release-notes/3.2/#ephemeralfortest-storage-engine) is used.

## Credits

Most code was copied from [mongo-in-memory](https://github.com/giorgio-zamparelli/mongo-in-memory)

### Changes:

- Don't save metadata in node_modules
- Don't generate random folders
- Clean up of metadata must be handled by user
- 100% Promise API
- Update mongodb-prebuilt to the newest version
- Update dependencies and tests
- Gracefully shutdown Mongodb when execute stop
- Create recursively databasePath