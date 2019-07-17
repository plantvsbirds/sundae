const uuid = require('uuid/v1')

const Dockerode = require('dockerode')
const docker = new Dockerode()

const express = require('express')
const expressBodyParser = require('body-parser')

const innerAppPort = 8081
const innerApp = express()
innerApp.use(expressBodyParser.json())

const outerAppPort = 8080
const outerApp = express()
const outerAppLongPoll = require("express-longpoll")(outerApp)
outerApp.use(expressBodyParser.json())


const instanceStages = [
  'CREATE',
  'RUNNING',
  'KILLING',
  'DEAD'
]
let instances = []
let getInsById = (id) => instances.find((i) => i.id == id)
let getInsByCid = (id) => instances.find((i) => i.cid == id)
let dockerOpsErrHandler = err => console.log(err)


innerApp.get('/ping', (req, res, next) => {
  res.json({'pong': true})
  next()
})

innerApp.post('/cookie', (req, res, next) => {
  const { cookies, id } = req.body
  let ins = getInsById(id)
  if (ins) {
    ins.cookies = {...ins.cookies, ...cookies}
  }
  res.json({'pong': true})
  next()
})

innerApp.get('/cookie/:id', (req, res, next) => {
  const { id } = req.params
  let ins = getInsById(id)
  if (ins) {
    res.json(ins.cookies)
    next()
  } else {
    res.status(404).json({'not': 'found'})
    next()
  }
})

const hostAccessAddressFromDocker = '172.20.10.11'
innerApp.listen(innerAppPort, '0.0.0.0')

const startDockerSession = ({ id, url, scoop, share }) => {
  return docker.createContainer({
    Image: 'sundae-main',
    Env: [
      "ID=" + id,
      "env=docker",
      `host=${hostAccessAddressFromDocker}:${innerAppPort}`,
      `target=${url}`,
      `scoop=${scoop}`,
      `share=${share}`,
    ],
    PublishAllPorts: true,
    Tty: true,
    NetworkingConfig: {
      EndpointsConfig: {
        "sundae-network": {

        }
      }
    }
  })
  .then((container) => {
    // getInsById(id).container = container
    getInsById(id).cid = container.id
    getInsById(id).ports = null
    getInsById(id).publicPort = null
    getInsById(id).container = container
    return container.start()
  })
  .then((cinfo) => {
    console.log(`container ${cinfo.id} started`)
    return Promise.resolve({ id })
  })
  .catch(dockerOpsErrHandler)
}

const instanceStatusUpdateInterval = setInterval(() => {
  docker.listContainers({
    all: false,
  }).then((containers) => {
    containers.filter(({ NetworkSettings, Ports, Id }) => {
      let ins = getInsByCid(Id)
      if (!ins)
        return
      else {
        ins.ports = Ports
        ins.publicPort = Ports.find(p => p.PrivatePort == 6901).PublicPort
      }
    })
  })
  .catch(dockerOpsErrHandler)
}, 500)

const createPoll = (ins) => {
    outerAppLongPoll.create('/' + ins.id, {})
    ins.poll = setInterval(() => {
      pub(ins)
    }, 500)
  }

const createInstance = ({ payload }) => {
  let ins = {
    ...payload,
    id: uuid(),
    stage: instanceStages[0],
  }
  instances.push(ins)
  createPoll(ins)
  return startDockerSession(ins)
}
const killInstance = ({ payload: { id } }) => {
  let ins = getInsById(id)
  if (!ins)
    return null
  
  ins.stage = 'KILLING'
  return ins.container.kill()
    .then(() => {
      pub(ins)
      setTimeout(() => {
        clearInterval(ins.poll)
      }, 60 * 1000) 

    })
    .catch(dockerOpsErrHandler)
}

const pub = (ins) => {
    let _ins = {...ins}
    _ins.container = null
    _ins.poll = null

    outerAppLongPoll.publish('/' + ins.id, _ins)
}
outerApp.use(express.static('static'));
outerApp.get('/share', (req, res, next) => {
  res.sendFile('./static/share.html', {root: '.'})
})

outerApp.get('/scoop/:id', (req, res, next) => {
  let { id }= req.params
  if (getInsById(id)) {
    res.sendFile('./static/scoop.html', {root: '.'})
  } else {
    res.status(404).send('Sorry, we cannot find that!');
  }
})
outerApp.post('/scoop/:id', (req, res, next) => {
  let { id }= req.params
  let ins = getInsById(id)
  if (ins) {
    startDockerSession({...ins, scoop: true, share: false}).then(() => {
        res.json({ id })
        createPoll(ins)
    })
  } else {
    res.status(404).send('Sorry, we cannot find that!');
  }
})

outerApp.post('/share', (req, res, next) => {
  createInstance({ payload: req.body }).then((d) => res.json(d))
})

outerApp.delete('/share', (req, res, next) => {
  killInstance({ payload: req.body }).then(() => {
    res.json({})
  })
})

outerApp.listen(outerAppPort)
