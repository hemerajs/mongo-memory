const MongodbPrebuilt = require('mongodb-prebuilt')

let mongodHelper = new MongodbPrebuilt.MongoDBPrebuilt()

mongodHelper.mongoDBDownload.downloadAndExtract()

.then((downloadLocation) => {
  console.log(`Downloaded MongoDB: ${downloadLocation}`)
  process.exit(0)
}, (err) => {
  console.error(err)
  process.exit(1)
})
