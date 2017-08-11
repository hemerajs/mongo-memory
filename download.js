const MongodbPrebuilt = require('mongodb-prebuilt')

let mongodHelper = new MongodbPrebuilt.MongoDBPrebuilt()

mongodHelper.mongoDBDownload.downloadAndExtract()

.then((downloadLocation) => {
  console.log(`Downloaded MongoDB: ${downloadLocation}`)
}, (err) => {
  throw err
})
