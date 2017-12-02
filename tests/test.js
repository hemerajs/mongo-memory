'use strict'

process.on('unhandledRejection', up => { throw up })

/* eslint-disable no-unused-expressions */

const expect = require('chai').expect
const Path = require('path')

const MongoInMemory = require('./../')

describe('mock-in-memory', function () {
  this.timeout(50000)

  let mongoInMemory
  const port = 8568
  const databaseName = 'testDatabaseName'

  before(function () {
    mongoInMemory = new MongoInMemory(port, Path.join(__dirname, '/tempdb/.data'))
    return mongoInMemory.start()
  })

  after(function () {
    return mongoInMemory.stop()
  })

  it('getMongouri() should return a valid mongouri', function (done) {
    let mongouri = mongoInMemory.getMongouri(databaseName)
    expect(mongouri).to.exist

    expect('mongodb://127.0.0.1:' + port + '/' + databaseName).to.be.equal(mongouri)
    done()
  })

  it('getConnection() should return a valid mongodb driver connection', function () {
    return mongoInMemory.getConnection(databaseName).then((connection) => {
      expect(connection).to.exist
    })
  })

  it('getCollection() should return a valid mongodb driver connection', function () {
    var collection = 'airplanes'

    return mongoInMemory.getCollection(databaseName, collection).then((collection) => {
      expect(collection).to.exist
    })
  })

  it('addDocument() should add a document successfully', function () {
    var document = { 'manufacturer': 'Boeing', 'model': '747', 'color': 'white' }

    var collection = 'airplanes'

    return mongoInMemory.addDocument(databaseName, collection, document).then((documentActual) => {
      expect(documentActual).to.exist
      expect(documentActual._id).to.exist

      return mongoInMemory.getDocumentById(databaseName, collection, documentActual._id).then((documentActual) => {
        expect(documentActual).to.exist
      })
    })
  })

  it('getDocumentById() should get a document successfully', function () {
    var document = { 'manufacturer': 'Boeing', 'model': '747', 'color': 'white' }

    var collection = 'airplanes'

    return mongoInMemory.addDocument(databaseName, collection, document).then((documentActual) => {
      expect(documentActual).to.exist
      expect(documentActual._id).to.exist

      return mongoInMemory.getDocumentById(databaseName, collection, documentActual._id).then((documentActual) => {
        expect(documentActual).to.exist
      })
    })
  })

  it('getDocumentById() should get a document with EJSON successfully', function () {
    var document = { '_id': {'$oid': '53c2ab5e4291b17b666d742c'}, 'manufacturer': 'Boeing', 'model': '747', 'color': 'white' }

    var collection = 'airplanes'

    return mongoInMemory.addDocument(databaseName, collection, document).then((documentActual) => {
      expect(documentActual).to.exist
      expect(documentActual._id).to.exist

      return mongoInMemory.getDocumentById(databaseName, collection, { '_id': {'$oid': '53c2ab5e4291b17b666d742c'} }).then((documentActual) => {
        expect(documentActual).to.exist
      })
    })
  })

  it('addDocument() should add a document with EJSON successfully', function () {
    var document = {'_id': {'$oid': '53c2ab5e4291b17b666d742a'}, 'last_seen_at': {'$date': 1405266782008}, 'display_name': {'$undefined': true}}

    var collection = 'airplanes'

    return mongoInMemory.addDocument(databaseName, collection, document).then((documentActual) => {
      expect(documentActual).to.exist
      expect(documentActual._id).to.exist

      return mongoInMemory.getDocumentById(databaseName, collection, documentActual._id).then((documentActual) => {
        expect(documentActual._id.toString()).to.be.equals('53c2ab5e4291b17b666d742a')
      })
    })
  })

  it('addDirectoryOfCollections() should add stubs documents to the correct collections', function () {
    let collectionsPath = './tests/stubs-mongo-collections'
    let toyotaPriusBlue = require('./stubs-mongo-collections/cars/toyota-prius-blue.json')
    let piaggioVespaWhite = require('./stubs-mongo-collections/motorbikes/piaggio-vespa-white.json')

    return mongoInMemory.addDirectoryOfCollections(databaseName, collectionsPath).then((documentsAdded) => {
      expect(documentsAdded.length).to.equal(2)

      return mongoInMemory.getConnection(databaseName).then((connection) => {
        expect(connection).to.exist

        return connection.collection('cars').findOne({ '_id': toyotaPriusBlue._id }).then((toyotaPriusBlueActual) => {
          expect(toyotaPriusBlueActual).to.exist
          expect(toyotaPriusBlueActual._id).to.be.equals('d74bf49333792abb24f048fe')
          expect(toyotaPriusBlue).to.be.deep.equal(toyotaPriusBlueActual)

          return connection.collection('motorbikes').findOne({ '_id': piaggioVespaWhite._id }).then((piaggioVespaWhiteActual) => {
            expect(piaggioVespaWhiteActual).to.exist
            expect(piaggioVespaWhiteActual._id).to.be.equals('ec939793b7d8fe8f9f2aa807')
            expect(piaggioVespaWhite).to.be.deep.equal(piaggioVespaWhiteActual)
          })
        })
      })
    })
  })

  it('addDirectoryOfCollections() should add stubs EJSON documents to the correct collections', function () {
    let collectionsPath = './tests/stubs-ejson-collections'
    let ejson = require('./stubs-ejson-collections/cars/toyota-prius-blue.json')

    return mongoInMemory.addDirectoryOfCollections(databaseName, collectionsPath).then((documentsAdded) => {
      expect(documentsAdded.length).to.equal(1)

      return mongoInMemory.getConnection(databaseName).then((connection) => {
        expect(connection).to.exist

        return connection.collection('cars').findOne({ '_id': mongoInMemory.mongodb.ObjectId(ejson._id.$oid) }).then((ejsonResult) => {
          expect(ejsonResult._id.toString()).to.be.equals('ec939793b7d8fe8f9f2aa707')
        })
      })
    })
  })
})
