const apiRootPrefix = ''
const Router = require('./router')


// SundaeStore
import { handleProxyRequest } from './proxy'

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const r = new Router()
    // Replace with the approriate paths and handlers
    // todo import key
    // todo unpack req
    // todo authenticate

    r.allMethods(apiRootPrefix + '/proxy', handleProxyRequest)
    r.get(apiRootPrefix + '/', () => new Response(__webpack_hash__)) // return a default message for the root route

    const resp = await r.route(request)
    return resp
}
