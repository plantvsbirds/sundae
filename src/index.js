const uuidv4 = require('uuid/v4')

const apiRootPrefix = '/api-test'
const Router = require('./router')


// SundaeStore
import { handleRegistrationRequest } from './registration'
import { handleProxyRequest } from './proxy'
const SundaeProxy = require('./registration')

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const r = new Router()
    // Replace with the approriate paths and handlers
    
    r.get(apiRootPrefix + '/reg', handleRegistrationRequest)
    r.allMethods(apiRootPrefix + '/proxy', handleProxyRequest)
    r.get(apiRootPrefix + '/', () => new Response(__webpack_hash__)) // return a default message for the root route

    const resp = await r.route(request)
    return resp
}
