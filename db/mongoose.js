const mongoose = require('mongoose')
const fs = require('fs')

var options = {
  useNewUrlParser: true,
  useCreateIndex: true
}

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost:27017/EmailSentimentAnalysisApp',options)

mongoose.connection.on('error', () => {
  console.log('Failed to connect to database shuting down')
  process.exit(1)
  fs.appendFileSync('./../error.log', 'Failed to connect to database on start up' )
})

module.exports = {mongoose}
