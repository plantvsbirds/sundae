const http = require('http')
const parser = require('url')
var bodyParser = require('body-parser')
const { Request, Response, Headers } = require('node-fetch')
const { promisify } = require('util');

const retEmpty = (res) => {
    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.write("404\n")
    res.end()
}

const shouldReqHaveBody = (req) => !(new Set(['GET', 'HEAD'])).has(req.method)
const convHttpReqToFetchReq = async (req) => {
    const parser = promisify(bodyParser.raw({
        type: "*/*"
    }))

    await parser(req, null)

    newReq = new Request("/proxy", {
        method: req.method,
        headers: new Headers(req.headers),
        body: shouldReqHaveBody(req) ? req.body : undefined,
    })
    console.log(newReq.body)
    return newReq
}
const doProxy = async (req, res) => {
    let [newReq, newRes] = [await convHttpReqToFetchReq(req), res]

    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.write("40123\n")
    res.end()
}

const server = http.createServer(async (req, res) => {
    const url = parser.parse(req.url, true)
    const { pathname } = url
    if (pathname === '/proxy')
        return await doProxy(req, res)
    return retEmpty(res)
})


server.listen(8080);