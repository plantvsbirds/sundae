const express = require('express')
const innerApp = express()
const outerApp = express()

const expressBodyParser = require('body-parser')
innerApp.use(expressBodyParser.json())
outerApp.use(expressBodyParser.json())


const cookieStore = {}


innerApp.get('/ping', (req, res, next) => {
  res.json({'pong': true})
  next()
})

innerApp.post('/cookie-report', (req, res, next) => {
  const { cookies, clientId } = req.body
  cookieStore[clientId] = cookies
  res.json({'pong': true})
  next()
})

innerApp.listen(12345, '127.0.0.1')

// outerApp.use(express.static(__dirname + '/static'));
outerApp.get('/share', (req, res, next) => {
  res.sendFile('./static/share.html', {root: '.'})
})

outerApp.post('/share', (req, res, next) => {
  console.log(req.body)
  res.json({'pong': true})
})


outerApp.listen(80)