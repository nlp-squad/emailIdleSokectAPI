// 3rd Party Dependencies
const inbox = require('inbox')
const {simpleParser} = require('mailparser')
const axios = require('axios')
const app = require('express')();
const server = require('http').Server(app)
const io = require('socket.io')(server)

// Local Dependecies
const Email = require('./models/emails')
const mongoose = require('./db/mongoose.js')

const fs = require('fs')

server.listen(80)

var incomingmail = io
  .of('/incomingmail')
  .on('connection', (socket) => {
    socket.emit('initialised', {
      message: 'Connection Established'
    })
  })

var client = inbox.createConnection(false,'imap.gmail.com',{
  secureConnection: true,
  auth: {
    user: 'adienpiercetest@gmail.com',
    pass: 'simplepassword'
  }
})

client.connect()

client.on('connect', () =>{
   console.log('Connected')
   client.openMailbox("INBOX", function(error, info){
        if(error) throw error;
        console.log("Message count in INBOX: " + info.count);
    });
})

client.on('new', (message) => {
  var messagestream = client.createMessageStream(message.UID)
  simpleParser(messagestream).then((parsed) => {
    var email = {
      To: parsed.to.text,
      FromAddress: parsed.from.value[0].address,
      FromName: parsed.from.value[0].name,
      Subject: parsed.subject,
      Message: parsed.text,
      Date: parsed.date
    }
    let emails = [email]

    axios.post('http://127.0.0.1:5000/setsentiment', emails).then((res) => {
      // console.log(res.data)
      newEmail = new Email(res.data[0])
      newEmail.save().then((eml) => {
        console.log('Sending to client')
        incomingmail.emit('newmail', eml)
      }).catch((err) => {
        console.log('Error Saving to database')
        fs.appendFileSync('./error.log', JSON.stringify(err) + '\n')
      })
    }).catch((err) => {
      console.log('Error connecting to Sentiment API check error log')
      fs.appendFileSync('./error.log', JSON.stringify(err) + '\n')
    })
  })
})