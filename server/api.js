const express = require('express')
const innerApp = express()
const outerApp = express()

const expressBodyParser = require('body-parser')
innerApp.use(expressBodyParser.json())
outerApp.use(expressBodyParser.json())

const outerAppLongPoll = require("express-longpoll")(outerApp)

const uuid = require('uuid/v1')

const Dockerode = require('dockerode')
const docker = new Dockerode()

const cookieStore = {}
const instanceStages = [
  'CREATE',
  'RUNNING',
  'KILLING',
  'DEAD'
]
let instances = []
let getInsById = (id) => instances.find((i) => i.id == id)

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

innerApp.listen(8081, '127.0.0.1')

const startDockerSession = ({ id }) => {
  return docker.createContainer({
    Image: 'aa',
    // Cmd: []
    ID: id,
    Env: ["ID=" + id, "env=docker"],
    PublishAllPorts: true,
    // Tty: true,
    Detach: true,
  })
  .then((container) => {
    // getInsById(id).container = container
    // console.log(container)
    return container.start()
  })
  .then((dat) => {
    console.log(dat)
    return Promise.resolve({ id })
  })
  .catch(err => console.log(err))
}
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
  return startDockerSession(ins)
}
const killInstance = ({ payload: { id } }) => {
  let ins = getInsById(id)
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
  createInstance({ payload: req.body }).then((d) => res.json(d))
})
outerApp.delete('/share', (req, res, next) => {
  res.json(killInstance({ payload: req.body }))
})


outerApp.listen(8080)