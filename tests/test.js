'use strict'

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
      expect(document).to.exist
      expect(document._id).to.exist

      return mongoInMemory.getDocument(databaseName, collection, document._id).then((documentActual) => {
        expect(documentActual).to.exist
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
          expect(toyotaPriusBlue).to.be.deep.equal(toyotaPriusBlueActual)

          return connection.collection('motorbikes').findOne({ '_id': piaggioVespaWhite._id }).then((piaggioVespaWhiteActual) => {
            expect(piaggioVespaWhiteActual).to.exist
            expect(piaggioVespaWhite).to.be.deep.equal(piaggioVespaWhiteActual)
          })
        })
      })
    })
  })
})
