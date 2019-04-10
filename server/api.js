const express = require('express')
const innerApp = express()
const outerApp = express()

const expressBodyParser = require('body-parser')
innerApp.use(expressBodyParser.json())
outerApp.use(expressBodyParser.json())

const outerAppLongPoll = require("express-longpoll")(outerApp)

const uuid = require('uuid/v1')

const cookieStore = {}
const instanceStages = [
  'CREATE',
  'RUNNING',
  'KILLING',
  'DEAD'
]
let instances = []

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

const pub = (ins) => 
    outerAppLongPoll.publish('/' + ins.id, ins)
const createInstance = ({ payload }) => {
  let ins = {
    ...payload,
    id: uuid(),
    stage: instanceStages[0],
  }
  instances.push(ins)
  outerAppLongPoll.create('/' + ins.id, {})
  ins.poll = setInterval(() => {
    pub(ins)
  }, 1000)
  return {id: ins.id}
}
const killInstance = ({ payload: { id } }) => {
  let ins = instances.find((i) => i.id == id)
  ins.stage = 'KILLING'

  pub(ins)
  setTimeout(() => {
    clearInterval(ins.poll)
  }, 60 * 1000)
  return {id: ins.id}
}
// outerApp.use(express.static(__dirname + '/static'));
outerApp.get('/share', (req, res, next) => {
  res.sendFile('./static/share.html', {root: '.'})
})

outerApp.post('/share', (req, res, next) => {
  res.json(createInstance({ payload: req.body }))
})
outerApp.delete('/share', (req, res, next) => {
  res.json(killInstance({ payload: req.body }))
})


outerApp.listen(80)