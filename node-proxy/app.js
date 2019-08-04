const http = require('http')
const parser = require('url')
const bodyParser = require('body-parser')
const { ServerResponse } = require('http')
const { Readable } = require('stream')
const { Request, Response, Headers } = require('node-fetch')
const { promisify } = require('util');

const { handleProxyRequest } = require('./proxy')

const retStatus = (res, st) => {
    res.writeHead(st, {'Content-Type': 'text/plain'})
    res.write(`${st}\n`)
    res.end()
}

const shouldReqHaveBody = (req) => !(new Set(['GET', 'HEAD'])).has(req.method)
const reqBodyParser = promisify(bodyParser.raw({
    type: "*/*"
}))

const convHttpReqToFetchReq = async (req) => {
    await reqBodyParser(req, null)

    newReq = new Request("/proxy", {
        method: req.method,
        headers: new Headers(req.headers),
        body: shouldReqHaveBody(req) ? req.body : undefined,
        redirect: 'manual', // use headers setting
        signal: null, // pass AbortSignal

        follow: 0,
    })
    return newReq
}
const convFetchResToHttpRes = async (fetchRes, res) => {
    if (!fetchRes.ok) {
        console.log("fetchRes not ok")
        console.log(fetchRes)
        // return retStatus(res, 500)
    }
    console.log(fetchRes.status)
    // console.log(fetchRes.body)
    // console.log("^^")
    // console.log(fetchRes.body instanceof Readable)

    res.writeHead(fetchRes.status, fetchRes.headers.raw())

    if (fetchRes.body instanceof Readable) {
        fetchRes.body.pipe(res)
        await promisify(res.end)
    } else
        res.end(fetchRes.body)

    // await promisify(res.end)
    return
}
const doProxy = async (req, res) => {
    let newReq = await convHttpReqToFetchReq(req)

    const proxyRes = await handleProxyRequest(newReq)

    return await convFetchResToHttpRes(proxyRes, res)
}

const server = http.createServer(async (req, res) => {
    const url = parser.parse(req.url, true)
    const { pathname } = url
    if (pathname === '/proxy/http')
        return await doProxy(req, res)
    return retStatus(res, 404)
})


server.listen(8080);