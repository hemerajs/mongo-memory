const MongodbPrebuilt = require('mongodb-prebuilt')
const Mkdirp = require('mkdirp')

Mkdirp.sync('./tempdb')
let mongodHelper = new MongodbPrebuilt.MongodHelper(['--port', '27018', '--dbpath', './tempdb', '--storageEngine', 'ephemeralForTest'])

mongodHelper.run().then(() => {
  console.log('mongodb downloaded')
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
