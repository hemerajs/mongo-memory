'use strict'

const Mongodb = require('mongodb')
const Fs = require('fs')
const Mkdirp = require('mkdirp')
const Path = require('path')
const MongodbPrebuilt = require('mongodb-prebuilt')
const serialize = require('mongodb-extended-json').serialize
const deserialize = require('mongodb-extended-json').deserialize

function MongoInMemory (port, dbPath) {
  this.databasePath = dbPath
  this.serverEventEmitter = null
  this.host = '127.0.0.1'
  this.port = port || 27017
  this.connections = {}
  this.mongodHelper = null
  this.serialize = serialize
  this.deserialize = deserialize
  this.mongodb = Mongodb
}

MongoInMemory.prototype.start = function () {
  Mkdirp.sync(this.databasePath)

  const mongodHelper = new MongodbPrebuilt.MongodHelper(['--bind_ip', this.host, '--port', this.port, '--dbpath', this.databasePath, '--storageEngine', 'ephemeralForTest'])
  this.mongodHelper = mongodHelper
  return mongodHelper.run()
}

MongoInMemory.prototype.getMongouri = function (databaseName) {
  return 'mongodb://' + this.host + ':' + this.port + '/' + databaseName
}

MongoInMemory.prototype.getConnection = function (databaseName) {
  if (this.connections[databaseName]) {
    return Promise.resolve(this.connections[databaseName])
  } else {
    return Mongodb.connect(this.getMongouri(databaseName)).then((connection) => {
      this.connections[databaseName] = connection
      return connection
    })
  }
}

MongoInMemory.prototype.getCollection = function (databaseName, collection) {
  return this.getConnection(databaseName).then(function (connection) {
    return connection.collection(collection)
  })
}

MongoInMemory.prototype.addDocument = function (databaseName, collectionName, document) {
  return this.getCollection(databaseName, collectionName).then(function (collection) {
    const ejsonDoc = deserialize(document)
    return collection.insertOne(ejsonDoc).then((result) => {
      if (result.n === 0) {
        return Promise.reject(new Error('no document was actually saved in the database'))
      } else {
        return result.ops[0]
      }
    })
  })
}

MongoInMemory.prototype.getDocumentById = function (databaseName, collectionName, documentId) {
  return this.getCollection(databaseName, collectionName).then((collection) => {
    let ejsonDoc

    if (typeof documentId !== 'string') {
      ejsonDoc = deserialize(documentId)
    } else {
      ejsonDoc = { '_id': documentId }
    }

    return collection.findOne(ejsonDoc)
  })
}

MongoInMemory.prototype.addDirectoryOfCollections = function (databaseName, collectionsPath) {
  return this.getConnection(databaseName).then((connection) => {
    let documentsAdded = []

    let collections = Fs.readdirSync(collectionsPath)

    for (let collection of collections) {
      var collectionPath = collectionsPath + '/' + collection

      if (Fs.lstatSync(collectionPath).isDirectory()) {
        let filenames = Fs.readdirSync(collectionPath)

        for (let filename of filenames) {
          var documentPath = collectionPath + '/' + filename
          let document = JSON.parse(Fs.readFileSync(documentPath, 'utf8'))
          const ejsonDoc = deserialize(document)
          connection.collection(collection).insertOne(ejsonDoc)
          documentsAdded.push(collection + '/' + filename)
        }
      }
    }

    return documentsAdded
  })
}

MongoInMemory.prototype.stop = function () {
  Object.keys(this.connections).map(databaseName => {
    this.connections[databaseName].close()
  })

  return new MongodbPrebuilt.MongoBins('mongo', ['--port', this.port, '--eval', "db.getSiblingDB('admin').shutdownServer()"]).run()
}

module.exports = MongoInMemory
