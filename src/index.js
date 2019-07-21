const uuidv4 = require('uuid/v4')
const Router = require('./router')

// SundaeStore
import { handleRegistrationRequest } from './registration'
import { handleProxyRequest } from './proxy'
const SundaeProxy = require('./registration')

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

function handler(request) {
    const init = {
        headers: { 'content-type': 'application/json' },
    }
    const body = JSON.stringify({ some: 'json' })
    return new Response(body, init)
}

async function handleRequest(request) {
    const r = new Router()
    // Replace with the approriate paths and handlers
    r.get('/reg', handleRegistrationRequest)
    r.allMethods('/proxy', handleProxyRequest)
    r.get('/', () => new Response(__webpack_hash__)) // return a default message for the root route

    const resp = await r.route(request)
    return resp
}
